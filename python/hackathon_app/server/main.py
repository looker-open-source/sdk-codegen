import flask
from looker_sdk import client


app = flask.Flask(__name__)
sdk = client.setup()


@app.route("/hackathons")
def get_hackathons():
    return flask.jsonify(["Hack 1", "Hack 2"])


@app.route("/register", methods=["POST"])
def register():
    return flask.jsonify({"ok": True, "message": "Congratulations!"})
