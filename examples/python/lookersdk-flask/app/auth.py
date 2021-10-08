import functools
import os
import flask
import werkzeug.security

from .db import get_db
from .looker import get_my_user

bp = flask.Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/register", methods=("GET", "POST"))
def register():
    if flask.request.method == "POST":
        username = flask.request.form["username"]
        password = flask.request.form["password"]
        db = get_db()
        error = None

        if not username:
            error = "Username is required."
        elif not password:
            error = "Password is required."
        elif (
            db.execute("SELECT id FROM user WHERE username = ?", (username,)).fetchone()
            is not None
        ):
            error = "User {} is already registered.".format(username)

        if error is None:
            db.execute(
                "INSERT INTO user (username, password) VALUES (?, ?)",
                (username, werkzeug.security.generate_password_hash(password)),
            )
            db.commit()
            flask.flash("Successfully registered. You may now log in.")
            return flask.redirect(flask.url_for("auth.login"))
        flask.flash(error)
    return flask.render_template("auth/register.html")


@bp.route("/login", methods=("GET", "POST"))
def login():
    if flask.request.method == "POST":
        username = flask.request.form["username"]
        password = flask.request.form["password"]
        db = get_db()
        error = None
        user = db.execute(
            "SELECT * FROM user WHERE username = ?", (username,)
        ).fetchone()

        if user is None:
            error = "Incorrect username."
        elif not werkzeug.security.check_password_hash(user["password"], password):
            error = "Incorrect password."

        if error is None:
            flask.session.clear()
            flask.session["user_id"] = user["id"]
            flask.session["user_name"] = user["username"]
            return flask.redirect(flask.url_for("index"))
        flask.flash(error)
    return flask.render_template("auth/login.html")


# This fires before every request and loads in the looker base URL to be available in the header
@bp.before_app_request
def load_instance():
    flask.session["lookerurl"] = os.environ.get("LOOKERSDK_BASE_URL")


@bp.route("/logout")
def logout():
    flask.session.clear()
    return flask.redirect(flask.url_for("index"))


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if flask.session["user_id"] is None:
            return flask.redirect(flask.url_for("auth.login"))
        return view(**kwargs)

    return wrapped_view
