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
from typing import cast, Callable, Dict, MutableMapping, Optional

import requests

from looker_sdk.rtl import transport


class RequestsTransport(transport.Transport):
    """RequestsTransport implementation of Transport."""

    def __init__(
        self, settings: transport.PTransportSettings, session: requests.Session
    ):
        self.settings = settings
        headers: Dict[str, str] = {transport.LOOKER_API_ID: settings.agent_tag}
        if settings.headers:
            headers.update(settings.headers)
        session.headers.update(headers)
        session.verify = settings.verify_ssl
        self.session = session
        self.logger = logging.getLogger(__name__)

    @classmethod
    def configure(cls, settings: transport.PTransportSettings) -> transport.Transport:
        return cls(settings, requests.Session())

    def request(
        self,
        method: transport.HttpMethod,
        path: str,
        query_params: Optional[MutableMapping[str, str]] = None,
        body: Optional[bytes] = None,
        authenticator: transport.TAuthenticator = None,
        transport_options: Optional[transport.TransportOptions] = None,
    ) -> transport.Response:

        headers = {}
        timeout = self.settings.timeout
        if authenticator:
            headers.update(authenticator(transport_options or {}))
        if transport_options:
            if transport_options.get("headers"):
                headers.update(transport_options["headers"])
            if transport_options.get("timeout"):
                timeout = transport_options["timeout"]
        self.logger.info("%s(%s)", method.name, path)
        try:
            resp = self.session.request(
                method.name,
                path,
                auth=NullAuth(),
                params=query_params,
                data=body,
                headers=headers,
                timeout=timeout,
            )
        except IOError as exc:
            ret = transport.Response(
                False,
                bytes(str(exc), encoding="utf-8"),
                transport.ResponseMode.STRING,
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


class NullAuth(requests.auth.AuthBase):
    """A custom auth class which ensures requests does not override authorization
    headers with netrc file credentials if present.
    """

    def __call__(self, r):
        return r
