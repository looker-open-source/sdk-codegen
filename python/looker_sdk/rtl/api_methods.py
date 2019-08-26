"""Functionality for making authenticated API calls
"""
import datetime
import json
from typing import MutableMapping, Optional, Sequence, Type, Union

from looker_sdk import error
from looker_sdk.rtl import model
from looker_sdk.rtl import serialize
from looker_sdk.rtl import transport
from looker_sdk.rtl import auth_session


TBody = Optional[
    Union[
        str,
        MutableMapping[str, str],
        Sequence[str],
        Sequence[int],
        model.Model,
        Sequence[model.Model],
    ]
]
TStructure = Optional[Union[Type[str], serialize.TStructure]]
TReturn = Optional[Union[transport.TResponseValue, serialize.TDeserializeReturn]]
TQueryParams = MutableMapping[
    str, Union[None, bool, str, int, Sequence[int], Sequence[str], datetime.datetime]
]


class APIMethods:
    """Functionality for making authenticated API calls
    """

    def __init__(
        self,
        usr_session: auth_session.AuthSession,
        deserialize: serialize.TDeserialize,
        serialize: serialize.TSerialize,
        transport: transport.Transport,
    ):
        self.usr_session = usr_session
        self.deserialize = deserialize
        self.serialize = serialize
        self.transport = transport

    def __enter__(self) -> "APIMethods":
        return self

    def __exit__(self, *exc) -> None:
        self.usr_session.logout()

    def _return(self, response: transport.Response, structure: TStructure) -> TReturn:
        if not response.ok:
            raise error.SDKError(response.value)
        ret: TReturn
        if structure is None:
            ret = None
        elif structure is str:
            ret = response.value
        else:
            ret = self.deserialize(response.value, structure)
        return ret

    def _convert_query_params(
        self, query_params: TQueryParams
    ) -> MutableMapping[str, str]:
        params: MutableMapping[str, str] = {}
        for k, v in query_params.items():
            if v is None:
                continue
            if isinstance(v, datetime.datetime):
                params[k] = f'{v.isoformat(timespec="minutes")}Z'
            elif isinstance(v, str):
                params[k] = v
            else:
                params[k] = json.dumps(v)
        return params

    def login_user(self, user_id: int) -> "APIMethods":
        self.usr_session.login_user(user_id)
        return self

    def logout(self) -> None:
        self.usr_session.logout()

    def get(
        self,
        path: str,
        structure: TStructure,
        query_params: Optional[TQueryParams] = None,
    ) -> TReturn:
        """GET method
        """
        params = self._convert_query_params(query_params) if query_params else None
        response = self.transport.request(
            transport.HttpMethod.GET,
            path,
            query_params=params,
            body=None,
            authenticator=self.usr_session.authenticate,
        )
        return self._return(response, structure)

    def _get_serialized(self, body: TBody) -> Optional[bytes]:
        serialized: Optional[bytes]
        if isinstance(body, str):
            serialized = body.encode("utf-8")
        elif isinstance(body, (list, dict, model.Model)):
            serialized = self.serialize(body)
        else:
            serialized = None
        return serialized

    def post(
        self,
        path: str,
        structure: TStructure,
        query_params: Optional[TQueryParams] = None,
        body: TBody = None,
    ) -> TReturn:
        """POST method
        """
        params = self._convert_query_params(query_params) if query_params else None
        serialized = self._get_serialized(body)
        response = self.transport.request(
            transport.HttpMethod.POST,
            path,
            query_params=params,
            body=serialized,
            authenticator=self.usr_session.authenticate,
        )
        return self._return(response, structure)

    def patch(
        self,
        path: str,
        structure: TStructure,
        query_params: Optional[TQueryParams] = None,
        body: TBody = None,
    ) -> TReturn:
        """PATCH method
        """
        params = self._convert_query_params(query_params) if query_params else None
        serialized = self._get_serialized(body)
        response = self.transport.request(
            transport.HttpMethod.PATCH,
            path,
            query_params=params,
            body=serialized,
            authenticator=self.usr_session.authenticate,
        )
        return self._return(response, structure)

    def put(
        self,
        path: str,
        structure: TStructure = None,
        query_params: Optional[TQueryParams] = None,
        body: TBody = None,
    ) -> TReturn:
        """PUT method
        """
        params = self._convert_query_params(query_params) if query_params else None
        serialized = self._get_serialized(body)
        response = self.transport.request(
            transport.HttpMethod.PUT,
            path,
            query_params=params,
            body=serialized,
            authenticator=self.usr_session.authenticate,
        )
        return self._return(response, structure)

    def delete(
        self,
        path: str,
        structure: TStructure = None,
        query_params: Optional[MutableMapping[str, str]] = None,
    ) -> TReturn:
        """DELETE method
        """
        response = self.transport.request(
            transport.HttpMethod.DELETE,
            path,
            body=None,
            authenticator=self.usr_session.authenticate,
        )
        return self._return(response, structure)
