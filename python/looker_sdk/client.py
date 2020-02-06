# The MIT License (MIT)
#
# Copyright (c) 2019 Looker Data Sciences, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

"""Client entry point
"""
from typing import Optional
import warnings

from looker_sdk.rtl import api_settings
from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import serialize
from looker_sdk.rtl import auth_session
from looker_sdk.sdk.api31 import methods as methods31
from looker_sdk.sdk.api40 import methods as methods40


SPECIFIC_FACTORY = (
    "Please use a version specific function such as "
    "client.setup31() or client.setup40()"
)
API_SETTINGS_API_VERSION_DEPRECATED = (
    f"API_VERSION config value is no longer needed. {SPECIFIC_FACTORY}"
)


class SetupError(Exception):
    pass


def setup(
    config_file: str = "looker.ini", section: Optional[str] = None
) -> methods31.LookerSDK:
    """Default dependency configuration
    """
    warnings.warn(
        message=DeprecationWarning(
            f"client.setup() will be removed in future versions, {SPECIFIC_FACTORY}"
        )
    )
    settings = api_settings.ApiSettings.configure(config_file, section)
    if settings.api_version:
        warnings.warn(message=DeprecationWarning(API_SETTINGS_API_VERSION_DEPRECATED))
    if settings.api_version and settings.api_version != "3.1":
        raise SetupError(
            "You are attempting to use the Looker31SDK with an api_version config setting of '3.1'"
        )
    settings.api_version = "3.1"
    settings.headers = {"Content-Type": "application/json"}
    if not settings.is_configured():
        raise SetupError(
            f"Missing required configuration values like base_url and api_version."
        )
    transport = requests_transport.RequestsTransport.configure(settings)
    return methods31.Looker31SDK(
        auth_session.AuthSession(settings, transport, serialize.deserialize31),
        serialize.deserialize31,
        serialize.serialize,
        transport,
    )


def setup31(
    config_file: str = "looker.ini", section: Optional[str] = None
) -> methods31.Looker31SDK:
    """Default dependency configuration
    """
    settings = api_settings.ApiSettings.configure(config_file, section)
    if settings.api_version is not None:
        warnings.warn(message=DeprecationWarning(API_SETTINGS_API_VERSION_DEPRECATED))
    settings.api_version = "3.1"
    settings.headers = {"Content-Type": "application/json"}
    if not settings.is_configured():
        raise SetupError(
            f"Missing required configuration values like base_url and api_version."
        )
    transport = requests_transport.RequestsTransport.configure(settings)
    return methods31.Looker31SDK(
        auth_session.AuthSession(settings, transport, serialize.deserialize),
        serialize.deserialize,
        serialize.serialize,
        transport,
    )


def setup40(
    config_file: str = "looker.ini", section: Optional[str] = None
) -> methods40.Looker40SDK:
    """Default dependency configuration
    """
    settings = api_settings.ApiSettings.configure(config_file, section)
    if settings.api_version is not None:
        warnings.warn(message=DeprecationWarning(API_SETTINGS_API_VERSION_DEPRECATED))
    settings.api_version = "4.0"
    settings.headers = {"Content-Type": "application/json"}
    if not settings.is_configured():
        raise SetupError(
            f"Missing required configuration values like base_url and api_version."
        )
    transport = requests_transport.RequestsTransport.configure(settings)
    return methods40.Looker40SDK(
        auth_session.AuthSession(settings, transport, serialize.deserialize40),
        serialize.deserialize40,
        serialize.serialize,
        transport,
    )
