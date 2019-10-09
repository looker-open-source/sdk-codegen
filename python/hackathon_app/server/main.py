import os

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
