"""Test the requests transport.
"""
import dataclasses

import pytest

from looker.rtl import transport as tp
from looker.rtl import requests_transport as rtp


@pytest.fixture
def requests_session():
    @dataclasses.dataclass(frozen=True)
    class Response:
        text: str

    class Session:
        def __init__(self):
            self.headers = {}

        def request(self, method, url, params=None, data=None, headers=None):
            return Response('yay!')

    return Session()


def test_request_minimal(requests_session):
    """Test basic successful round trip
    """
    settings = tp.TransportSettings(base_url='/some/path', api_version='3.1')
    test = rtp.RequestsTransport(settings, requests_session)
    resp = test.request(tp.HttpMethod.GET, '/some/path')
    assert isinstance(resp, tp.SDKSuccessResponse)
    assert resp.value == 'yay!'
