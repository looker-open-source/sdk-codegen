import abc
from typing import Optional, Union
from looker.rtl import requests_transport as rtp
from looker.rtl import auth_token as at
from looker.rtl import transport as tp


# TODO: confirm about name mangling 

class BaseUserSession(abc.ABC):
    """UserSession base class"""

    @property
    @abc.abstractmethod
    def is_impersonating(self) -> bool:
        raise NotImplementedError

    @property
    @abc.abstractmethod
    def is_authenticated(self) -> bool:
        raise NotImplementedError

    @abc.abstractmethod
    def get_token(self) -> at.AuthToken:
        raise NotImplementedError

    @abc.abstractmethod
    def login(self, user_id: Optional[str] = None) -> at.AuthToken:
        raise NotImplementedError

    @abc.abstractmethod
    def authenticate(self):
        # TODO: still to be built based on request
        raise NotImplementedError

    @abc.abstractmethod
    def logout(self) -> bool:
        raise NotImplementedError


class UserSession(BaseUserSession):

    def __init__(self, settings, transport: Optional[transport.Transport]):
        self._token: at.AuthToken = at.AuthToken()
        self.user_id: str = ''
        self.settings = settings
        self.transport = transport or rtp.RequestsTransport.configure(settings)

    @property
    def is_authenticated(self) -> bool:
        if not (self._token and self._token.access_token):
            return False
        return self._token.is_active

    @property
    def is_impersonating(self) -> bool:
        return bool(self.user_id) and self.is_authenticated

    def get_token(self):
        if not self.is_authenticated:
            self.login()
        return self._token

    def authenticate(self):
         # TODO: still to be built based on request
        return

    def login(self, user_id: Optional[str] = None) -> at.AuthToken:
        if not self.is_authenticated:
            token = self.__login(user_id)
            self._token = at.AuthToken(token)
            return token
        return self._token

    def __login(self, user_id: Optional[str]) -> tp.SDKSuccessResponse.value:
        if (user_id and self.user_id != user_id):
            # We are switching user ids
            self.__logout()

        self.__reset()

        # pylint: disable=too-many-function-args
        result = self.__ok(self.transport.request(tp.HttpMethod.POST,
                                                  '/login',
                                                  body={
                                                      'client_id': self.settings.client_id,
                                                      'client_secret': self.settings.client_secret
                                                  }))
        return result

    def logout(self) -> bool:
        result = False
        if self.is_authenticated:
            result = self.__logout()
        return result

    def __logout(self):
        token = self._token
        # TODO: this is still to be built based on authenticator

    def __reset(self):
        self._token = at.AuthToken()

    def __ok(self, response: Union[tp.SDKErrorResponse, tp.SDKSuccessResponse]
            ) -> Union[tp.SDKErrorResponse, tp.SDKSuccessResponse.value]:
        if response.ok:
            return response.value
        raise tp.SDKErrorResponse
