import abc
from typing import Optional, Union, Dict
import urllib.parse

from looker.rtl import (api_settings as st, auth_token as at,
                        requests_transport as rtp, transport as tp, sdk_error
                        as se, serialize as sr)
from looker.sdk import models as ml


class UserSession():
    def __init__(self,
                 settings: st.ApiSettings,
                 transport: Optional[tp.Transport] = None,
                 deserialize: Optional[sr.TDeserialize] = None):
        self._token: at.AuthToken = at.AuthToken()
        self.user_id: str = ''
        self.settings = settings
        # TODO Argument 1 to "configure" of "RequestsTransport" has incompatible type "ApiSettings"; expected "TransportSettings"
        # we should create a tp.TransportSettings instance from settings to pass to
        # rtp.RequestsTransport.configure()
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
        header = {}
        if token and token.access_token:
            header['Authorization'] = f'token {token.access_token}'
        return header

    def login(self, user_id: Optional[str] = None) -> at.AuthToken:
        """Logs in a user or allows an already logged in user to sudo as another user."""
        if not self.is_authenticated:
            token = self._login(user_id)
            # Argument 1 to "AuthToken" has incompatible type "Union[str, bytes, None]"; expected "Optional[AccessToken]"
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

        # why isn't {client_id, client_secret} an sdk model that the
        # POST /login takes as body like most of the other POST methods?
        # hacky to manually formdata encode it here... would rather
        # sr.serialize() it
        serialized_body = urllib.parse.urlencode({
            'client_id':
            self.settings.client_id,
            'client_secret':
            self.settings.client_secret
        }).encode('utf-8')
        # pylint: disable=too-many-function-args
        result = self._ok(
            self.transport.request(tp.HttpMethod.POST,
                                   path,
                                   body=serialized_body), ml.AccessToken)
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
            structure: Optional[sr.TStructure] = None,
    ) -> Union[tp.TResponseValue, ml.AccessToken]:
        if response.ok:
            result = self.deserialize(
                response.value, structure) if structure else response.value
            # don't have this return type quite right yet...
            # Incompatible return value type (got "Union[str, bytes, SDKModel, List[SDKModel], None]", expected "Union[str, bytes, None, AccessToken]")
            # need to think about how to type this correctly
            return result
        raise se.SDKError(response.status_code, response.value)
