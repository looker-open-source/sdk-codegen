"""Functionality for making authenticated API calls
"""
from typing import MutableMapping, Optional

from looker.rtl import api_settings as st
from looker.rtl import model as ml
from looker.rtl import requests_transport as rtp
from looker.rtl import serialize as sr
from looker.rtl import transport as tp
from looker.rtl import user_session as us


class APIMethods:
    """Functionality for making authenticated API calls
    """

    def __init__(
        self,
        user_session: us.UserSession,
        deserialize: sr.TDeserialize,
        serialize: sr.TSerialize,
        transport: tp.Transport,
    ):
        self.user_session = user_session

        self.deserialize = deserialize
        self.serialize = serialize
        self.transport = transport

    @classmethod
    def configure(cls, settings_file: str = "looker.ini") -> "APIMethods":
        """Default dependency configuration
        """
        settings = st.ApiSettings.configure(settings_file)
        transport = rtp.RequestsTransport.configure(settings)
        user_session = us.UserSession(settings, transport)
        return cls(user_session, sr.deserialize, sr.serialize, transport)

    def get(
        self,
        structure: sr.TStructure,
        path: str,
        query_params: Optional[MutableMapping[str, str]] = None,
    ) -> sr.TDeserializeReturn:
        """GET method
        """
        response = self.transport.request(
            tp.HttpMethod.GET,
            path,
            query_params=query_params,
            body=None,
            authenticator=self.user_session.authenticate,
        )
        return self.deserialize(response.value, structure)

    def post(self, path: str, body: ml.Model) -> sr.TDeserializeReturn:
        """POST method
        """
        serialized_body = self.serialize(body)
        response = self.transport.request(
            tp.HttpMethod.POST,
            path,
            body=serialized_body,
            authenticator=self.user_session.authenticate,
        )
        return self.deserialize(response.value, body.__class__)

    def patch(self, path: str, body: ml.Model) -> sr.TDeserializeReturn:
        """PATCH method
        """
        serialized_body = self.serialize(body)
        response = self.transport.request(
            tp.HttpMethod.PATCH,
            path,
            body=serialized_body,
            authenticator=self.user_session.authenticate,
        )
        return self.deserialize(response.value, body.__class__)

    def delete(self, path: str) -> None:
        """DELETE method
        """
        self.transport.request(
            tp.HttpMethod.DELETE, path, authenticator=self.user_session.authenticate
        )
