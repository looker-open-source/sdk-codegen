import os

import flask
import flask_wtf  # type: ignore
from looker_sdk import client
import wtforms  # type: ignore
from wtforms import validators


app = flask.Flask(__name__)
app.config["WTF_CSRF_SECRET_KEY"] = "foobar"
app.config["SECRET_KEY"] = "goobar"
sdk = client.setup()


class RegistrationForm(flask_wtf.FlaskForm):

    firstName = wtforms.StringField("firstName", validators=[validators.DataRequired()])
    lastName = wtforms.StringField("lastName", validators=[validators.DataRequired()])
    email = wtforms.StringField(
        "email", validators=[validators.DataRequired(), validators.Email()]
    )
    organization = wtforms.StringField(
        "organization", validators=[validators.DataRequired()]
    )
    hackathon = wtforms.StringField("hackathon", validators=[validators.DataRequired()])
    ndaq = wtforms.StringField("ndaq", validators=[validators.DataRequired()])
    codeOfConduct = wtforms.StringField(
        "codeOfConduct", validators=[validators.DataRequired()]
    )
    contributing = wtforms.StringField(
        "contributing", validators=[validators.DataRequired()]
    )


@app.route("/hackathons")
def get_hackathons():
    return flask.jsonify(["Hack 1", "Hack 2"])


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
    # pass form.data to sheets module and looker module
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
