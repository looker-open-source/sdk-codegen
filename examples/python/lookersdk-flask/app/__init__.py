import os

from flask import Flask
from . import db
from . import auth
from . import blog
from . import looker


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY="dev",
        DATABASE=os.path.join(app.instance_path, "lookersdk-flask.sqlite"),
    )

    if test_config is None:
        # Load real config unless we are testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_mapping(test_config)
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize app and register our blueprints
    db.init_app(app)
    app.register_blueprint(auth.bp)
    app.register_blueprint(blog.bp)
    app.add_url_rule("/", endpoint="index")

    return app
