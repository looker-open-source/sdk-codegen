"""UserSession to provid automatic authentication
"""
from typing import Dict, Optional
import urllib.parse

from looker.rtl import api_settings as st
from looker.rtl import auth_token as at
from looker.rtl import requests_transport as rtp
from looker.rtl import transport as tp
from looker.rtl import serialize as sr
from looker.rtl import model as ml


class UserSessionError(Exception):
    """Authentication problems.
    """


class UserSession():
    """UserSession to provid automatic authentication
    """

    def __init__(self,
                 settings: st.ApiSettings,
                 transport: Optional[tp.Transport] = None,
                 deserialize: Optional[sr.TDeserialize] = None):
        self._token: at.AuthToken = at.AuthToken()
        self.user_id: str = ''
        self.settings = settings
        self.transport = transport or rtp.RequestsTransport.configure(settings)
        self.deserialize = deserialize or sr.deserialize

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
        return {'Authorization': f'token {token.access_token}'}

    def login(self, user_id: Optional[str] = None) -> at.AuthToken:
        """Logs in a user or allows an already logged in user to sudo as another user."""
        if not self.is_authenticated:
            token = self._login(user_id)
            self._token = at.AuthToken(token)
        return self._token

    def _login(self, user_id: Optional[str]) -> ml.AccessToken:
        path = '/login'
        if (user_id and self.user_id != user_id):
            # We are switching user ids
            self._logout()
            self.user_id = user_id
            path += f'/{user_id}'

        self._reset()

        serialized = urllib.parse.urlencode({
            'client_id': self.settings.client_id,
            'client_secret': self.settings.client_secret
        }).encode('utf-8')
        response = self.transport.request(tp.HttpMethod.POST,
                                          path,
                                          body=serialized)
        if not response.ok:
            raise UserSessionError(str(response.value))
        token = self.deserialize(response.value, ml.AccessToken)
        if not isinstance(token, ml.AccessToken):
            raise UserSessionError(str(response.value))
        return token

    def logout(self) -> bool:
        """Logs out current active user.

        Returns true if the current user was logged in, False if not.
        """
        was_logged_in = False
        if self.is_authenticated:
            was_logged_in = True
            self._logout()
        return was_logged_in

    def _logout(self) -> bool:
        response = self.transport.request(tp.HttpMethod.DELETE,
                                          '/logout',
                                          authenticator=self.authenticate)

        if not response.ok:
            raise UserSessionError(str(response.value))

        if self.user_id:
            # Impersonated user was logged out, so set auth back to default
            self.user_id = ''
            self.login()
        else:
            self._reset()

        return True

    def _reset(self):
        self._token = at.AuthToken()
