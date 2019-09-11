"""Client entry point
"""
from typing import Optional

from looker_sdk.rtl import api_settings
from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import serialize
from looker_sdk.rtl import auth_session
from looker_sdk.sdk import methods


def setup(
    config_file: str = "looker.ini", section: Optional[str] = None
) -> methods.LookerSDK:
    """Default dependency configuration
    """
    settings = api_settings.ApiSettings.configure(config_file, section)
    settings.headers = {"Content-Type": "application/json"}
    transport = requests_transport.RequestsTransport.configure(settings)
    return methods.LookerSDK(
        auth_session.AuthSession(settings, transport, serialize.deserialize),
        serialize.deserialize,
        serialize.serialize,
        transport,
    )
