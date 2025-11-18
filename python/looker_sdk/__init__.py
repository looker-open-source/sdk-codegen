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

from typing import Optional, Tuple

from looker_sdk.rtl import api_settings
from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import serialize
from looker_sdk.rtl import auth_session
from looker_sdk.sdk import constants

# F401 - providing convenience shortcut for methods/models at top level
from looker_sdk.sdk.api40 import methods as methods40
from looker_sdk.sdk.api40 import models as models40  # noqa: F401
from looker_sdk.sdk.api40 import streams as streams40

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

def init40(
    config_file: str = "looker.ini",
    section: Optional[str] = None,
    config_settings: Optional[api_settings.ApiSettings] = None,
) -> Tuple[methods40.Looker40SDK, streams40.Looker40SDKStream]:
    """Default dependency configuration"""
    settings = (
        _settings(config_file, section) if config_settings is None else config_settings
    )
    settings.is_configured()
    transport = requests_transport.RequestsTransport.configure(settings)
    auth = auth_session.AuthSession(
        settings, transport, serialize.deserialize40, "4.0"
    )
    sdk = methods40.Looker40SDK(
        auth,
        serialize.deserialize40,
        serialize.serialize40,
        transport,
        "4.0",
    )
    stream = streams40.Looker40SDKStream(
        auth,
        serialize.deserialize40,
        serialize.serialize40,
        transport,
        "4.0",
    )
    return sdk, stream
