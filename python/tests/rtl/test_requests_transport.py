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

import attr
import pytest  # type: ignore

from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import transport
from looker_sdk.rtl import constants


@attr.s(auto_attribs=True)
class Response:
    """Fake requests.Response
    """

    ok: bool
    text: str


class Session:
    """Fake requests.Session
    """

    def __init__(self, ret_val, error=False):
        self.headers = {}
        self.ret_val = ret_val
        self.error = error

    def request(self, method, url, params, data, headers, timeout):
        """Fake request.Session.request
        """
        if self.error:
            raise IOError((54, "Connection reset by peer"))
        return self.ret_val


@pytest.fixture
def settings():
    return transport.TransportSettings(
        base_url="/some/path", api_version="3.1", headers=None, verify_ssl=True
    )


def test_configure(settings):
    """Test configuration creates instance.
    """

    test = requests_transport.RequestsTransport.configure(settings)
    assert isinstance(test, requests_transport.RequestsTransport)
    assert test.session.headers.get("User-Agent") == f"PY-SDK {constants.sdk_version}"


def test_request_ok(settings):
    """Test basic successful round trip
    """
    ret_val = Response(ok=True, text="yay!")
    session = Session(ret_val)
    test = requests_transport.RequestsTransport(settings, session)
    resp = test.request(transport.HttpMethod.GET, "/some/path")
    assert isinstance(resp, transport.Response)
    assert resp.value == "yay!"
    assert resp.ok is True


def test_request_not_ok(settings):
    """Test API error response
    """
    ret_val = Response(ok=False, text="Some API error")
    session = Session(ret_val)
    test = requests_transport.RequestsTransport(settings, session)
    resp = test.request(transport.HttpMethod.GET, "/some/path")
    assert isinstance(resp, transport.Response)
    assert resp.value == "Some API error"
    assert resp.ok is False


def test_request_error(settings):
    """Test network error response
    """
    session = Session(None, True)
    test = requests_transport.RequestsTransport(settings, session)
    resp = test.request(transport.HttpMethod.GET, "/some/path")
    assert isinstance(resp, transport.Response)
    assert resp.value == "(54, 'Connection reset by peer')"
    assert resp.ok is False
