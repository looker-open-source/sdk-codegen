"""Test the requests transport.
"""
import dataclasses

from looker.rtl import transport as tp
from looker.rtl import requests_transport as rtp


# pylint: disable=too-few-public-methods
@dataclasses.dataclass(frozen=True)
class Response:
    """Fake requests.Response
    """
    text: str
    ok: bool


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
            raise IOError((54, 'Connection reset by peer'))
        return self.ret_val


def test_configure():
    """Test configuration creates instance.
    """
    settings = tp.TransportSettings(base_url='/some/path', api_version='3.1')
    test = rtp.RequestsTransport.configure(settings)
    assert isinstance(test, rtp.RequestsTransport)


def test_request_ok():
    """Test basic successful round trip
    """
    settings = tp.TransportSettings(base_url='/some/path', api_version='3.1')
    ret_val = Response('yay!', True)
    session = Session(ret_val)
    test = rtp.RequestsTransport(settings, session)
    resp = test.request(tp.HttpMethod.GET, '/some/path')
    assert isinstance(resp, tp.Response)
    assert resp.value == 'yay!'
    assert resp.ok is True


def test_request_not_ok():
    """Test API error response
    """
    settings = tp.TransportSettings(base_url='/some/path', api_version='3.1')
    ret_val = Response('Some API error', False)
    session = Session(ret_val)
    test = rtp.RequestsTransport(settings, session)
    resp = test.request(tp.HttpMethod.GET, '/some/path')
    assert isinstance(resp, tp.Response)
    assert resp.value == 'Some API error'
    assert resp.ok is False


def test_request_error():
    """Test network error response
    """
    settings = tp.TransportSettings(base_url='/some/path', api_version='3.1')
    session = Session(None, True)
    test = rtp.RequestsTransport(settings, session)
    resp = test.request(tp.HttpMethod.GET, '/some/path')
    assert isinstance(resp, tp.Response)
    assert resp.value == "(54, 'Connection reset by peer')"
    assert resp.ok is False
