"""Functionality for making authenticated API calls
"""
from __future__ import annotations

from typing import MutableMapping, Optional

from looker.rtl import (api_settings, user_session as us, transport as tp,
                        serialize as sr, requests_transport as rtp)


class APIMethods:
    """Functionality for making authenticated API calls
    """
    def __init__(self, user_session: us.UserSession,
                 deserialize: sr.TDeserializeFunc, transport: tp.Transport):
        self.user_session = user_session
        self.deserialize = deserialize
        self.transport = transport

    @classmethod
    def configure(cls, settings_file: str = 'looker.ini') -> APIMethods:
        """Default dependency configuration
        """
        settings = api_settings.ApiSettings(settings_file)
        transport_settings = tp.TransportSettings(
            settings.base_url, settings.api_version,
            {'User-Agent': f'LookerSDK Python {settings.api_version}'})
        transport = rtp.RequestsTransport.configure(transport_settings)
        user_session = us.UserSession(settings, transport)
        return cls(user_session, sr.deserialize, transport)

    def get(self,
            model: sr.SDKModel,
            many: bool,
            path: str,
            query_params: Optional[MutableMapping[str, str]] = None
            ) -> sr.TDeserializeReturn:
        """GET method
        """
        response = self.transport.request(
            tp.HttpMethod.GET,
            path,
            query_params=query_params,
            body=None,
            authenticator=self.user_session.authenticate)
        return self.deserialize(response.value, model, many)
