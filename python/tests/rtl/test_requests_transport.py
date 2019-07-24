"""Test the requests transport.
"""

from looker.rtl import transport as tp
from looker.rtl import requests_transport as rtp


def test_request_minimal():
    """Test basic successful round trip
    """
    settings = tp.TransportSettings(base_url='/some/path', api_version='3.1')
    test = rtp.RequestsTransport.configure(settings)
    resp = test.request(tp.HttpMethod.GET, '/some/path')
    assert isinstance(resp, tp.SDKSuccessResponse)
    assert resp.value == 'yay!'
