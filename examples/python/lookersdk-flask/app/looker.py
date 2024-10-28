"""
Contains all of the Looker auth & SDK methods used in the app.
"""

import looker_sdk
import base64

# See the Python SDK README for complete instructions on initializing the Python SDK
# https://github.com/looker-open-source/sdk-codegen/tree/main/python

# Rename the looker.ini.sample file in the project root to looker.ini and fill it out
sdk = looker_sdk.init40("app/looker.ini")
# Or uncomment below to use environment variables instead, if you have set them.
# sdk = looker_sdk.init40('lookersdk-flask/looker.ini')


def get_my_user():
    my_user = sdk.me()
    return my_user


def get_looks():
    response = sdk.all_looks()
    return response


def get_html_for_look(look_id):
    response = sdk.run_look(look_id=look_id, result_format="html", apply_vis=True)
    return response


def get_image_for_look(look_id):
    response = sdk.run_look(
        look_id=look_id, result_format="png", image_width=300, image_height=300
    )
    image_string = base64.b64encode(response)
    return image_string
