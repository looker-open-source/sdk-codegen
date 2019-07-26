import abc
from typing import Optional, Union, Dict

from looker.rtl import requests_transport as rtp
from looker.rtl import auth_token as at
from looker.rtl import transport as tp
from looker.rtl import sdk_error as se

class BaseUserSession(abc.ABC):
    """UserSession base class"""
    @property
    @abc.abstractmethod
    def is_impersonating(self) -> bool:
        """Determines if user is impersonating another user"""
    @property
    @abc.abstractmethod
    def is_authenticated(self) -> bool:
        """Determines if current token is active"""
    @abc.abstractmethod
    def get_token(self) -> at.AuthToken:
        """Returns an active token"""
    @abc.abstractmethod
    def login(self, user_id: Optional[str] = None) -> at.AuthToken:
        """Logs in a user or allows an already logged in user to sudo as another user"""
    @abc.abstractmethod
    def authenticate(self) -> Dict[str, str]:
        """Create a dictionary with the current token to be used as a header"""
    @abc.abstractmethod
    def logout(self) -> bool:
        """Logs out current user"""


class UserSession(BaseUserSession):
    def __init__(self, settings, transport: Optional[tp.Transport]):
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

    def authenticate(self) -> Dict[str, str]:
        token = self.get_token()
        header = {}
        if token and token.access_token:
            header['Authorization'] = f'token {token.access_token}'
        return header

    def login(self, user_id: Optional[str] = None) -> at.AuthToken:
        if not self.is_authenticated:
            token = self._login(user_id)
            self._token = at.AuthToken(token)
        return self._token

    def _login(self, user_id: Optional[str]) -> tp.Response.value:
        if (user_id and self.user_id != user_id):
            # We are switching user ids
            self._logout()

        self._reset()

        # pylint: disable=too-many-function-args
        result = self._ok(
            self.transport.request(tp.HttpMethod.POST,
                                   '/login',
                                   body={
                                       'client_id': self.settings.client_id,
                                       'client_secret':
                                       self.settings.client_secret
                                   }))
        return result

    def logout(self) -> bool:
        if self.is_authenticated:
            result = self._logout()
        return bool(result)

    def _logout(self) -> tp.Response.value:
        token = self._token
        result = self._ok(
            self.transport.request(
                tp.HttpMethod.DELETE,
                '/logout',
                authenticator=(lambda: {
                    'Authorization': f'token {token.access_token}'
                }) if token else None))
        return result

    def _reset(self):
        self._token = at.AuthToken()

    def _ok(self,
            response: tp.Response) -> Union[tp.Response.value, se.SDKError]:
        if response.ok:
            return response.value
        raise se.SDKError(response.status_code, response.value)
