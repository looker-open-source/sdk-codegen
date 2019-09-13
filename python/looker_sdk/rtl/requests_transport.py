"""Transport implementation using requests package.
"""

import logging
from typing import Callable, Dict, MutableMapping, Optional

import requests

from looker_sdk.rtl import transport


class RequestsTransport(transport.Transport):
    """RequestsTransport implementation of Transport.
    """

    def __init__(
        self, settings: transport.TransportSettings, session: requests.Session
    ):

        headers: Dict[str, str] = {"User-Agent": settings.agent_tag}
        if settings.headers:
            headers.update(settings.headers)
        session.headers.update(headers)
        session.verify = settings.verify_ssl
        self.session = session

        self.api_path: str = f"{settings.base_url}/api/{settings.api_version}"
        self.agent: str = f"LookerSDK Python {settings.api_version}"
        self.logger = logging.getLogger(__name__)

    @classmethod
    def configure(cls, settings: transport.TransportSettings) -> transport.Transport:
        return cls(settings, requests.Session())

    def request(
        self,
        method: transport.HttpMethod,
        path: str,
        query_params: Optional[MutableMapping[str, str]] = None,
        body: Optional[bytes] = None,
        authenticator: Optional[Callable[[], Dict[str, str]]] = None,
        headers: Optional[MutableMapping[str, str]] = None,
    ) -> transport.Response:

        url = f"{self.api_path}{path}"
        if headers is None:
            headers = {}
        if authenticator:
            headers.update(authenticator())
        logging.info("%s(%s)", method.name, url)
        try:
            resp = self.session.request(
                method.name, url, params=query_params, data=body, headers=headers
            )
        except IOError as exc:
            ret = transport.Response(False, str(exc))
        else:
            if resp.ok:
                ret = transport.Response(True, resp.text)
            else:
                ret = transport.Response(False, resp.text)

        return ret
