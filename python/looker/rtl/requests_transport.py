"""Transport implementation using requests package.
"""

import logging
from typing import Callable, Dict, MutableMapping, Optional

import requests

from looker.rtl import transport as tp


class RequestsTransport(tp.Transport):
    """RequestsTransport implementation of Transport.
    """
    def __init__(self, settings: tp.TransportSettings,
                 session: requests.Session):

        headers: Dict[str, str] = {}
        if settings.headers:
            headers.update(settings.headers)
        session.headers.update(headers)
        session.verify = settings.verify_ssl
        self.session = session

        self.api_path: str = f'{settings.base_url}/api/{settings.api_version}'
        self.agent: str = f'LookerSDK Python {settings.api_version}'
        self.logger = logging.getLogger(__name__)

    @classmethod
    def configure(cls, settings: tp.TransportSettings) -> tp.Transport:
        return cls(settings, requests.Session())

    # pylint: disable=too-many-arguments
    def request(self,
                method: tp.HttpMethod,
                path: str,
                query_params: Optional[MutableMapping[str, str]] = None,
                body: Optional[bytes] = None,
                authenticator: Optional[Callable[[], Dict[str, str]]] = None
                ) -> tp.Response:

        url = f'{self.api_path}{path}'
        headers = authenticator() if authenticator else {}
        logging.info('%s(%s)', method.name, url)
        try:
            resp = self.session.request(method.name,
                                        url,
                                        params=query_params,
                                        data=body,
                                        headers=headers)
        except IOError as exc:
            ret = tp.Response(False, str(exc))
        else:
            if resp.ok:
                ret = tp.Response(True, resp.text)
            else:
                ret = tp.Response(False, resp.text)

        return ret
