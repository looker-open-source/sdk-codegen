"""Transport implementation using requests package.
"""

from typing import (AnyStr, Callable, Dict, IO, MutableMapping, Optional,
                    Union)

import requests

from looker.rtl import transport as tp


class RequestsTransport(tp.Transport):
    """RequestsTransport implementation of Transport.
    """
    def __init__(self, settings: tp.TransportSettings,
                 session: requests.Session):
        headers: Dict[str, str] = {
            'User-Agent': f'LookerSDK Python {settings.api_version}'
        }
        if settings.headers:
            headers.update(settings.headers)
        session.headers.update(headers)

        self.session = session
        self.api_path: str = f'{settings.base_url}/api/{settings.api_version}'
        self.agent: str = f'LookerSDK Python {settings.api_version}'

    @classmethod
    def configure(cls, settings: tp.TransportSettings) -> tp.Transport:
        return cls(settings, requests.Session())

    # pylint: disable=too-many-arguments
    def request(self,
                method: tp.HttpMethod,
                path: str,
                query_params: Optional[MutableMapping[str, str]] = None,
                body: Optional[
                    Union[bytes, MutableMapping[str, str], IO[AnyStr]]] = None,
                authenticator: Optional[Callable[[], Dict[str, str]]] = None
                ) -> tp.Response:

        url = f'{self.api_path}/path'
        headers = authenticator() if authenticator else {}
        resp = self.session.request(method.name,
                                    url,
                                    params=query_params,
                                    data=body,
                                    headers=headers)

        # TODO - determine when to return resp.text vs resp.content
        return tp.Response(True, resp.text)
