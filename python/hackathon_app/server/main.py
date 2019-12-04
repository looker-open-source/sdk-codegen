import logging.config
import os
from typing import Any

import flask
import flask_wtf  # type: ignore
from google.oauth2 import id_token  # type: ignore
from google.auth.transport import requests  # type: ignore
import wtforms  # type: ignore
from wtforms import validators

import looker
import sheets

logging.config.fileConfig("logging.conf")


app = flask.Flask(__name__)
app.config.from_object("config")
app.logger.removeHandler(flask.logging.default_handler)


class RegistrationForm(flask_wtf.FlaskForm):
    """Form used for validating registration POST

    This form is not rendered and is only a copy of the React Formik form
    on the frontend. Hence the camelCase names.
    """

    first_name = wtforms.StringField(
        "First Name", validators=[validators.DataRequired()]
    )
    last_name = wtforms.StringField("Last Name", validators=[validators.DataRequired()])
    email = wtforms.StringField(
        "Email", validators=[validators.DataRequired(), validators.Email()]
    )
    organization = wtforms.StringField(
        "Organization", validators=[validators.DataRequired()]
    )
    role = wtforms.StringField("Role", validators=[validators.DataRequired()])
    hackathon = wtforms.StringField("Hackathon", validators=[validators.DataRequired()])
    tshirt_size = wtforms.StringField(
        "T-Shirt Size", validators=[validators.DataRequired()]
    )
    ndaq = wtforms.StringField("ndaq", validators=[validators.DataRequired()])
    code_of_conduct = wtforms.StringField(
        "Code Of Conduct", validators=[validators.DataRequired()]
    )
    contributing = wtforms.StringField(
        "Contributing", validators=[validators.DataRequired()]
    )
    email_verified = wtforms.BooleanField("Email Verified", validators=[])


@app.route("/user_info")
def user_info():
    response = {}
    if "looker_hackathon_auth" not in flask.request.cookies:
        return response
    auth_code = flask.request.cookies["looker_hackathon_auth"]
    sheets_client = sheets.Sheets(
        spreadsheet_id=app.config["GOOGLE_SHEET_ID"],
        cred_file=app.config["GOOGLE_APPLICATION_CREDENTIALS"],
    )
    user = sheets_client.users.auth_user(auth_code)
    if user:
        response["first_name"] = user.first_name
        response["last_name"] = user.last_name
    return response


@app.route("/verify_google_token", methods=["POST"])
def verify_google_token():
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        body = flask.request.json
        idinfo = id_token.verify_oauth2_token(
            body["Zi"]["id_token"],
            requests.Request(),
            "280777447286-iigstshu4o2tnkp5fjucrd3nvq03g5hs.apps.googleusercontent.com",
        )

        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        # If auth request is from a G Suite domain:
        # if idinfo['hd'] != GSUITE_DOMAIN_NAME:
        #     raise ValueError('Wrong hosted domain.')

        # ID token is valid. Get the user's Google Account ID from the decoded token.
    except ValueError as ex:
        # Invalid token
        return {"error": str(ex)}
    return idinfo


@app.route("/hackathons")
def hackathons():
    return get_hackathons()


def get_hackathons():
    sheets_client = sheets.Sheets(
        spreadsheet_id=app.config["GOOGLE_SHEET_ID"],
        cred_file=app.config["GOOGLE_APPLICATION_CREDENTIALS"],
    )
    try:
        hackathons = {h.name: h.label for h in sheets_client.get_hackathons()}
    except sheets.SheetError as ex:
        app.logger.error(ex, exc_info=True)
        hackathons = [""]
    return flask.jsonify(hackathons)


@app.route("/csrf")
def csrf():
    """Provide a csrf token for the registration form.

    https://medium.com/@iaincollins/csrf-tokens-via-ajax-a885c7305d4a
    """
    form = RegistrationForm()
    return flask.jsonify({"token": form.csrf_token.current_token})


@app.route("/register", methods=["POST"])
def register() -> Any:
    form = RegistrationForm()
    if not form.validate_on_submit():
        errors = {}
        for field, field_errors in form.errors.items():
            if field == "csrf_token":
                field = "validation"
                field_errors = ["Form is invalid"]
            errors[field] = ", ".join(field_errors)
        return {
            "ok": False,
            "message": "; ".join(f"{k}: {v}" for k, v in errors.items()),
        }

    response = {"ok": True, "message": "Congratulations!"}
    hackathon = form.data["hackathon"]
    first_name = form.data["first_name"]
    last_name = form.data["last_name"]
    email = form.data["email"]
    email_verified = form.data["email_verified"]
    register_user = sheets.RegisterUser(
        hackathon=hackathon,
        first_name=first_name,
        last_name=last_name,
        email=email,
        organization=form.data["organization"],
        role=form.data["role"],
        tshirt_size=form.data["tshirt_size"],
    )
    sheets_client = sheets.Sheets(
        spreadsheet_id=app.config["GOOGLE_SHEET_ID"],
        cred_file=app.config["GOOGLE_APPLICATION_CREDENTIALS"],
    )
    try:
        sheets_user = sheets_client.register_user(register_user)
    except sheets.SheetError as ex:
        app.logger.error(ex, exc_info=True)
        response = {"ok": False, "message": "There was a problem, try again later."}
    else:
        try:
            client_id = looker.register_user(
                hackathon=hackathon,
                first_name=first_name,
                last_name=last_name,
                email=email,
            )
        except looker.RegisterError as ex:
            app.logger.error(ex, exc_info=True)
            response = {
                "ok": False,
                "message": "There was a problem, try again later.",
            }
        else:
            try:
                sheets_user.client_id = client_id
                sheets_client.users.save(sheets_user)
            except sheets.SheetError as ex:
                app.logger.error(ex, exc_info=True)
                response = {
                    "ok": False,
                    "message": "There was a problem, try again later.",
                }
    resp = flask.jsonify(response)
    if response["ok"]:
        if email_verified:
            resp.set_cookie("looker_hackathon_auth", sheets_user.auth_code())
        else:
            sheets_client.users.send_auth_message(sheets_user, flask.request.host_url)
    return resp


@app.route("/status")
def status():
    assert get_hackathons()
    assert looker.me()
    status_path = os.path.join(app.static_folder, "status.json")
    return flask.send_file(status_path)


@app.route("/")
def main():
    index_path = os.path.join(app.static_folder, "index.html")
    return flask.send_file(index_path)


# Everything not declared before (not a Flask route / API endpoint)...
@app.route("/<path:path>")
def route_frontend(path):
    # ...could be a static file needed by the front end that
    # doesn't use the `static` path (like in `<script src="bundle.js">`)
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return flask.send_file(file_path)
    # ...or should be handled by the SPA's "router" in front end
    else:
        index_path = os.path.join(app.static_folder, "index.html")
        try:
            return flask.send_file(index_path)
        except FileNotFoundError:
            return ""
