# pylint: disable=C,R
# pylint: disable=redefined-outer-name

import attr
import pytest  # type: ignore

from looker.rtl import transport as tp
from looker.rtl import requests_transport as rtp


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

    # pylint: disable=unused-argument,too-many-arguments
    def request(self, method, url, params, data, headers):
        """Fake request.Session.request
        """
        if self.error:
            raise IOError((54, "Connection reset by peer"))
        return self.ret_val


@pytest.fixture
def settings():
    return tp.TransportSettings(
        base_url="/some/path", api_version="3.1", headers=None, verify_ssl=True
    )


def test_configure(settings):
    """Test configuration creates instance.
    """

    test = rtp.RequestsTransport.configure(settings)
    assert isinstance(test, rtp.RequestsTransport)


def test_request_ok(settings):
    """Test basic successful round trip
    """
    ret_val = Response(ok=True, text="yay!")
    session = Session(ret_val)
    test = rtp.RequestsTransport(settings, session)
    resp = test.request(tp.HttpMethod.GET, "/some/path")
    assert isinstance(resp, tp.Response)
    assert resp.value == "yay!"
    assert resp.ok is True


def test_request_not_ok(settings):
    """Test API error response
    """
    ret_val = Response(ok=False, text="Some API error")
    session = Session(ret_val)
    test = rtp.RequestsTransport(settings, session)
    resp = test.request(tp.HttpMethod.GET, "/some/path")
    assert isinstance(resp, tp.Response)
    assert resp.value == "Some API error"
    assert resp.ok is False


def test_request_error(settings):
    """Test network error response
    """
    session = Session(None, True)
    test = rtp.RequestsTransport(settings, session)
    resp = test.request(tp.HttpMethod.GET, "/some/path")
    assert isinstance(resp, tp.Response)
    assert resp.value == "(54, 'Connection reset by peer')"
    assert resp.ok is False
