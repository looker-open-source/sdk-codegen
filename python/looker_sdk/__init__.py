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

from typing import Optional

from looker_sdk.rtl import api_settings
from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import serialize
from looker_sdk.rtl import auth_session
from looker_sdk.sdk import constants

# F401 - providing convenience shortcut for methods/models at top level
from looker_sdk.sdk.api31 import methods, methods as methods31  # noqa:F401
from looker_sdk.sdk.api40 import methods as methods40
from looker_sdk.sdk.api31 import models, models as models31  # noqa:F401
from looker_sdk.sdk.api40 import models as models40  # noqa: F401

API_SETTINGS_API_VERSION_DEPRECATED = "API_VERSION config value is no longer needed."


def _settings(
    config_file: str, section: Optional[str] = None
) -> api_settings.ApiSettings:
    return api_settings.ApiSettings(
        filename=config_file,
        section=section,
        sdk_version=constants.sdk_version,
        env_prefix=constants.environment_prefix,
    )


def init31(
    config_file: str = "looker.ini", section: Optional[str] = None
) -> methods31.Looker31SDK:
    """Default dependency configuration"""
    settings = _settings(config_file, section)
    settings.is_configured()
    transport = requests_transport.RequestsTransport.configure(settings)
    return methods31.Looker31SDK(
        auth_session.AuthSession(settings, transport, serialize.deserialize31, "3.1"),
        serialize.deserialize31,
        serialize.serialize,
        transport,
        "3.1",
    )


def init40(
    config_file: str = "looker.ini", section: Optional[str] = None
) -> methods40.Looker40SDK:
    """Default dependency configuration"""
    settings = _settings(config_file, section)
    settings.is_configured()
    transport = requests_transport.RequestsTransport.configure(settings)
    return methods40.Looker40SDK(
        auth_session.AuthSession(settings, transport, serialize.deserialize40, "4.0"),
        serialize.deserialize40,
        serialize.serialize,
        transport,
        "4.0",
    )
