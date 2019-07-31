import abc
from typing import Optional, Union, Dict

from looker.rtl import (api_settings as st, auth_token as at,
                        requests_transport as rtp, transport as tp, sdk_error
                        as se, serialize as sr)
from looker.sdk import models as ml


class UserSession():
    def __init__(self,
                 settings: st.ApiSettings,
                 transport: Optional[tp.Transport] = None):
        self._token: at.AuthToken = at.AuthToken()
        self.user_id: str = ''
        self.settings = settings
        self.transport = transport or rtp.RequestsTransport.configure(settings)

    @property
    def is_authenticated(self) -> bool:
        """Determines if current token is active."""
        if not (self._token and self._token.access_token):
            return False
        return self._token.is_active

    @property
    def is_impersonating(self) -> bool:
        """Determines if user is impersonating another user."""
        return bool(self.user_id) and self.is_authenticated

    def get_token(self) -> at.AuthToken:
        """Returns an active token."""
        if not self.is_authenticated:
            self.login()
        return self._token

    def authenticate(self) -> Dict[str, str]:
        """Create a dictionary with the current token to be used as a header."""
        token = self.get_token()
        header = {}
        if token and token.access_token:
            header['Authorization'] = f'token {token.access_token}'
        return header

    def login(self, user_id: Optional[str] = None) -> at.AuthToken:
        """Logs in a user or allows an already logged in user to sudo as another user."""
        if not self.is_authenticated:
            token = self._login(user_id)
            self._token = at.AuthToken(token)
        return self._token

    def _login(self, user_id: Optional[str]) -> tp.TResponseValue:
        path = '/login'
        if (user_id and self.user_id != user_id):
            # We are switching user ids
            self._logout()
            self.user_id = user_id
            path += f'/{user_id}'

        self._reset()

        # pylint: disable=too-many-function-args
        result = self._ok(
            self.transport.request(tp.HttpMethod.POST,
                                   path,
                                   body={
                                       'client_id': self.settings.client_id,
                                       'client_secret':
                                       self.settings.client_secret
                                   }), ml.AccessToken)
        return result

    def logout(self) -> bool:
        """Logs out current active user."""
        if self.is_authenticated:
            self._logout()
        return True

    def _logout(self) -> tp.TResponseValue:
        result = self._ok(
            self.transport.request(
                tp.HttpMethod.DELETE,
                '/logout',
                authenticator=lambda:
                {'Authorization': f'token {self._token.access_token}'}))

        # if no error was thrown, logout was successful
        if self.user_id:
            # Impersonated user was logged out, so set auth back to default
            self.user_id = ''
            self.login()
        else:
            self._reset()

        return result

    def _reset(self):
        self._token = at.AuthToken()

    def _ok(
            self,
            response: tp.Response,
            model: sr.SDKModel = None,
    ) -> Union[tp.TResponseValue, se.SDKError]:
        if response.ok:
            result = sr.deserialize(response.value,
                                    model) if model else response.value
            return result
        raise se.SDKError(response.status_code, response.value)
