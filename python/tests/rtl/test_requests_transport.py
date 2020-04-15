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

from typing import cast, MutableMapping, Optional

import attr
import pytest  # type: ignore
import requests

from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import transport
from looker_sdk.rtl import constants


@attr.s(auto_attribs=True)
class Response:
    """Fake requests.Response
    """

    ok: bool
    content: bytes
    headers: MutableMapping[str, str]


class Session:
    """Fake requests.Session
    """

    def __init__(self, ret_val, error=False):
        self.headers = {}
        self.ret_val = ret_val
        self.error = error

    def request(self, method, url, auth, params, data, headers, timeout):
        """Fake request.Session.request
        """
        if self.error:
            raise IOError((54, "Connection reset by peer"))
        return self.ret_val


@attr.s(auto_attribs=True, kw_only=True)
class TransportSettings:
    """Fake TransportSettings
    """

    base_url: str = ""
    verify_ssl: bool = True
    timeout: int = 120
    headers: Optional[MutableMapping[str, str]] = None
    agent_tag: str = "foobar"

    def is_configured(self) -> bool:
        return bool(self.base_url)


@pytest.fixture
def settings():
    return TransportSettings(base_url="/some/path", headers=None, verify_ssl=True)


def test_configure(settings):
    """Test configuration creates instance.
    """

    test = requests_transport.RequestsTransport.configure(settings)
    assert isinstance(test, requests_transport.RequestsTransport)
    assert test.session.headers.get("x-looker-appid") == f"foobar"


parametrize = [
    ({"Content-Type": "application/json"}, "utf-8", transport.ResponseMode.STRING),
    ({"Content-Type": "image/png"}, "utf-8", transport.ResponseMode.BINARY),
    (
        {"Content-Type": "text/xml; charset=latin1"},
        "latin1",
        transport.ResponseMode.STRING,
    ),
    (
        {"Content-Type": "text/plain; charset=arabic"},
        "arabic",
        transport.ResponseMode.STRING,
    ),
    (
        {"Content-Type": "text/plain; charset=utf-8"},
        "utf-8",
        transport.ResponseMode.STRING,
    ),
    ({"Content-Type": "audio/gzip"}, "utf-8", transport.ResponseMode.BINARY),
]


@pytest.mark.parametrize(
    "headers, expected_encoding, expected_response_mode", parametrize
)
def test_request_ok(
    settings: transport.PTransportSettings,
    headers: MutableMapping[str, str],
    expected_response_mode: transport.ResponseMode,
    expected_encoding: str,
):
    """Test basic successful round trip
    """
    value = b"yay!"
    ret_val = Response(
        ok=True, content=value, headers=requests.structures.CaseInsensitiveDict(headers)
    )
    session = cast(requests.Session, Session(ret_val))
    test = requests_transport.RequestsTransport(settings, session)
    resp = test.request(transport.HttpMethod.GET, "/some/path")
    assert isinstance(resp, transport.Response)
    assert resp.value == value
    assert resp.ok is True
    assert resp.response_mode == expected_response_mode
    assert resp.encoding == expected_encoding


@pytest.mark.parametrize(
    "headers, expected_encoding, expected_response_mode", parametrize
)
def test_request_not_ok(
    settings: transport.PTransportSettings,
    headers: MutableMapping[str, str],
    expected_response_mode: transport.ResponseMode,
    expected_encoding: str,
):
    """Test API error response
    """
    value = b"Some API error"
    ret_val = Response(
        ok=False,
        content=value,
        headers=requests.structures.CaseInsensitiveDict(headers),
    )
    session = cast(requests.Session, Session(ret_val))
    test = requests_transport.RequestsTransport(settings, session)
    resp = test.request(transport.HttpMethod.GET, "/some/path")
    assert isinstance(resp, transport.Response)
    assert resp.value == value
    assert resp.ok is False
    assert resp.response_mode == expected_response_mode
    assert resp.encoding == expected_encoding


def test_request_error(settings):
    """Test network error response
    """
    session = cast(requests.Session, Session(None, True))
    test = requests_transport.RequestsTransport(settings, session)
    resp = test.request(transport.HttpMethod.GET, "/some/path")
    assert isinstance(resp, transport.Response)
    assert resp.value == b"(54, 'Connection reset by peer')"
    assert resp.ok is False
