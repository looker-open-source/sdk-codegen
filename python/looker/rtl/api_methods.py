"""Functionality for making authenticated API calls
"""
import datetime
import json
from typing import MutableMapping, Optional, Sequence, Type, Union

from looker.rtl import model as ml
from looker.rtl import serialize as sr
from looker.rtl import transport as tp
from looker.rtl import user_session as us


TBody = Optional[Union[str, Sequence[str], Sequence[int], ml.Model, Sequence[ml.Model]]]
TStructure = Optional[Union[Type[str], sr.TStructure]]
TReturn = Optional[Union[tp.TResponseValue, sr.TDeserializeReturn]]
TQueryParams = MutableMapping[
    str, Union[None, bool, str, int, Sequence[int], Sequence[str], datetime.datetime]
]


class APIError(Exception):
    """Error calling API.
    """


class APIMethods:
    """Functionality for making authenticated API calls
    """

    def __init__(
        self,
        usr_session: us.UserSession,
        deserialize: sr.TDeserialize,
        serialize: sr.TSerialize,
        transport: tp.Transport,
    ):
        self.usr_session = usr_session
        self.deserialize = deserialize
        self.serialize = serialize
        self.transport = transport

    def _return(self, response: tp.Response, structure: TStructure) -> TReturn:
        if not response.ok:
            raise APIError(response.value)
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
            tp.HttpMethod.GET,
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
        elif isinstance(body, ml.Model):
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
            tp.HttpMethod.POST,
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
            tp.HttpMethod.PATCH,
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
            tp.HttpMethod.PUT,
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
            tp.HttpMethod.DELETE,
            path,
            body=None,
            authenticator=self.usr_session.authenticate,
        )
        return self._return(response, structure)
