"""Client entry point
"""
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import serialize
from looker_sdk.rtl import user_session
from looker_sdk.sdk import methods


def setup(config_file: str = "Looker.ini") -> methods.LookerSDK:
    """Default dependency configuration
    """
    settings = api_settings.ApiSettings.configure(config_file)
    settings.headers = {"Content-Type": "application/json"}
    transport = requests_transport.RequestsTransport.configure(settings)
    usr_session = user_session.UserSession(settings, transport, serialize.deserialize)
    return methods.LookerSDK(
        usr_session, serialize.deserialize, serialize.serialize, transport
    )
