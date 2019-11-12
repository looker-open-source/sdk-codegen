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

"""Transport implementation using requests package.
"""

import logging
import urllib.parse
from typing import cast, Callable, Dict, MutableMapping, Optional

import requests

from looker_sdk.rtl import transport


class RequestsTransport(transport.Transport):
    """RequestsTransport implementation of Transport.
    """

    def __init__(
        self, settings: transport.TransportSettings, session: requests.Session
    ):
        self.settings = settings
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
        transport_options: Optional[transport.TransportSettings] = None,
    ) -> transport.Response:
        if headers is None:
            headers = {}
        if authenticator:
            headers.update(authenticator())
        timeout = self.settings.timeout
        if transport_options:
            timeout = transport_options.timeout
        request_path = self.make_path(
            path, query_params, authenticator, transport_options
        )
        logging.info("%s(%s)", method.name, request_path)
        try:
            resp = self.session.request(
                method.name,
                request_path,
                auth=NullAuth(),
                data=body,
                headers=headers,
                timeout=timeout,
            )
        except IOError as exc:
            ret = transport.Response(
                False, bytes(str(exc), encoding="utf-8"), transport.ResponseMode.STRING,
            )
        else:
            ret = transport.Response(
                resp.ok,
                resp.content,
                transport.response_mode(resp.headers.get("content-type")),
            )
            encoding = cast(
                Optional[str], requests.utils.get_encoding_from_headers(resp.headers)
            )
            if encoding:
                ret.encoding = encoding

        return ret

    def make_path(
        self,
        path: str,
        query_params: Optional[MutableMapping[str, str]],
        authenticator: Optional[Callable[[], Dict[str, str]]] = None,
        transport_options: Optional[transport.TransportSettings] = None,
    ) -> str:
        base = self.api_path if authenticator else transport_options.base_url
        if not path.startswith(("https:", "http:")):
            path = f"{base}{path}"
        path = self.add_query_params(path, query_params)
        return path

    def add_query_params(self, path: str, params: Optional[MutableMapping[str, str]]):
        if params:
            path += f"?{self.encode_params(params)}"
        return path

    def encode_params(self, values: MutableMapping[str, str]) -> str:
        params = urllib.parse.urlencode(values)
        return params


class NullAuth(requests.auth.AuthBase):
    """A custom auth class which ensures requests does not override authorization
    headers with netrc file credentials if present.
    """

    def __call__(self, r):
        return r
