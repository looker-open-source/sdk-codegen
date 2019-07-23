"""Transport implementation using requests package.
"""

from typing import Any, Callable, Union

import requests

from looker.rtl import transport


class RequestsTransport(transport.Transport):
    """RequestsTransport implementation of Transport.
    """
    def __init__(self, settings, service):
        self.settings = settings
        self.service = service

    @classmethod
    def configure(cls, settings):
        return cls(settings, requests)

    # pylint: disable=too-many-arguments
    def request(
            self,
            method: transport.HttpMethod,
            path: str,
            query_params: Any = None,
            body: Any = None,
            authenticator: Callable[[Any], Any] = None
    ) -> Union[transport.SDKSuccessResponse,
               Union[transport.SDKErrorResponse, transport.SDKError]]:
        # do the stuff and make the request using self.service
        return transport.SDKSuccessResponse('yay!')
