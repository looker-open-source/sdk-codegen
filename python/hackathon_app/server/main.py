import os

import flask
import flask_wtf  # type: ignore
from looker_sdk import client
import wtforms  # type: ignore
from wtforms import validators

import sheets


app = flask.Flask(__name__)
app.config.from_object("config")
sdk = client.setup()


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


@app.route("/hackathons")
def get_hackathons():
    sheets_client = sheets.Sheets(
        spreadsheet_id=app.config["GOOGLE_SHEET_ID"],
        cred_file=app.config["GOOGLE_APPLICATION_CREDENTIALS"],
    )
    return flask.jsonify(sheets_client.get_hackathons())


@app.route("/csrf")
def csrf():
    """Provide a csrf token for the registration form.

    https://medium.com/@iaincollins/csrf-tokens-via-ajax-a885c7305d4a
    """
    form = RegistrationForm()
    return flask.jsonify({"token": form.csrf_token.current_token})


@app.route("/register", methods=["POST"])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        response = {"ok": True, "message": "Congratulations!"}
        # pass form.data to sheets module and looker module
    else:
        errors = {}
        for field, field_errors in form.errors.items():
            if field == "csrf_token":
                field = "validation"
                field_errors = ["Form is invalid"]
            errors[field] = ", ".join(field_errors)
        response = {
            "ok": False,
            "message": "; ".join(f"{k}: {v}" for k, v in errors.items()),
        }
    return flask.jsonify(response)


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
        return flask.send_file(index_path)
