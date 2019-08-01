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
                 deserialize: sr.TDeserialize, serialize: sr.TSerialize,
                 transport: tp.Transport):
        self.user_session = user_session
        self.deserialize = deserialize
        self.serialize = serialize
        self.transport = transport

    @classmethod
    def configure(cls, settings_file: str = 'looker.ini') -> APIMethods:
        """Default dependency configuration
        """
        settings = api_settings.ApiSettings(settings_file)
        transport_settings = tp.TransportSettings(
            base_url=settings.base_url,
            api_version=settings.api_version,
            headers={'User-Agent': f'LookerSDK Python {settings.api_version}'},
            verify_ssl=True)
        transport = rtp.RequestsTransport.configure(transport_settings)
        user_session = us.UserSession(settings, transport)
        return cls(user_session, sr.deserialize, sr.serialize, transport)

    def get(self,
            structure: sr.TStructure,
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
        return self.deserialize(response.value, structure)

    def post(self, path: str, body: sr.SDKModel) -> sr.TDeserializeReturn:
        """POST method
        """
        serialized_body = self.serialize(body)
        response = self.transport.request(
            tp.HttpMethod.POST,
            path,
            body=serialized_body,
            authenticator=self.user_session.authenticate)
        return self.deserialize(response.value, body.__class__)

    def patch(self, path: str, body: sr.SDKModel) -> sr.TDeserializeReturn:
        """PATCH method
        """
        serialized_body = self.serialize(body)
        response = self.transport.request(
            tp.HttpMethod.PATCH,
            path,
            body=serialized_body,
            authenticator=self.user_session.authenticate)
        return self.deserialize(response.value, body.__class__)

    def delete(self, path: str) -> None:
        """DELETE method
        """
        self.transport.request(tp.HttpMethod.DELETE,
                               path,
                               authenticator=self.user_session.authenticate)
