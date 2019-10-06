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

"""Types and abstract base class for transport implementations.
"""
import abc
import enum
import re
from typing import Callable, Dict, MutableMapping, Optional

import attr

from looker_sdk.rtl import constants


class HttpMethod(enum.Enum):
    """Supported HTTP verbs.
    """

    GET = 1
    POST = 2
    PUT = 3
    DELETE = 4
    PATCH = 5
    TRACE = 6
    HEAD = 7


@attr.s(auto_attribs=True, kw_only=True)
class TransportSettings:
    """Basic transport settings.
    """

    base_url: str = ""
    api_version: str = "3.1"
    verify_ssl: bool = True
    timeout: int = 120
    headers: Optional[MutableMapping[str, str]] = None

    @property
    def url(self) -> str:
        """Create and return an API-versioned base endpoint.
        """
        return f'{self.base_url.rstrip("/")}/api/{self.api_version}'

    @property
    def agent_tag(self) -> str:
        """User Agent value
        """
        return f"PY-SDK {constants.sdk_version}"


TAuthenticator = Optional[Callable[[], Dict[str, str]]]


class ResponseMode(enum.Enum):
    """ResponseMode for an HTTP request - either binary or "string"
    """

    BINARY = 1
    STRING = 2
    UNKNOWN = 3


@attr.s(auto_attribs=True)
class Response:
    """Success Response object.
    """

    ok: bool
    value: bytes
    response_mode: ResponseMode
    encoding: str = "utf-8"


_STRING_MODE = re.compile(constants.RESPONSE_STRING_MODE, re.IGNORECASE)
_BINARY_MODE = re.compile(constants.RESPONSE_BINARY_MODE, re.IGNORECASE)


def response_mode(content_type: Optional[str] = None) -> ResponseMode:
    """Determine ResponseMode from http Content-Type header
    """
    response = ResponseMode.UNKNOWN
    if not content_type:
        return response

    if _STRING_MODE.search(content_type):
        response = ResponseMode.STRING
    elif _BINARY_MODE.search(content_type):
        response = ResponseMode.BINARY
    return response


class Transport(abc.ABC):
    """Transport base class.
    """

    @classmethod
    @abc.abstractmethod
    def configure(cls, settings: TransportSettings) -> "Transport":
        """Configure and return an instance of Transport
        """

    @abc.abstractmethod
    def request(
        self,
        method: HttpMethod,
        path: str,
        query_params: Optional[MutableMapping[str, str]] = None,
        body: Optional[bytes] = None,
        authenticator: TAuthenticator = None,
        headers: Optional[MutableMapping[str, str]] = None,
        transport_options: Optional[TransportSettings] = None,
    ) -> Response:
        """Send API request.
        """
