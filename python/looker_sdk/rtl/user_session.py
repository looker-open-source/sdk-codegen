"""UserSession to provid automatic authentication
"""
from typing import Dict
import urllib.parse

from looker_sdk.rtl import api_settings as st
from looker_sdk.rtl import auth_token as at
from looker_sdk.rtl import transport as tp
from looker_sdk.rtl import serialize as sr
from looker_sdk.rtl import model as ml


class UserSessionError(Exception):
    """Authentication problems.
    """


class UserSession:
    """UserSession to provid automatic authentication
    """

    def __init__(
        self,
        settings: st.ApiSettings,
        transport: tp.Transport,
        deserialize: sr.TDeserialize,
    ):
        self.user_token: at.AuthToken = at.AuthToken()
        self.admin_token: at.AuthToken = at.AuthToken()
        self.user_id: str = ""
        self.settings = settings
        self.transport = transport
        self.deserialize = deserialize

    def is_authenticated(self, token: at.AuthToken) -> bool:
        """Determines if current token is active."""
        if not (token.access_token):
            return False
        return token.is_active

    @property
    def is_user_authenticated(self) -> bool:
        return self.is_authenticated(self.user_token)

    @property
    def is_admin_authenticated(self) -> bool:
        return self.is_authenticated(self.admin_token)

    @property
    def is_impersonating(self) -> bool:
        """Determines if user is impersonating another user."""
        return bool(self.user_id) and self.is_user_authenticated

    def get_user_token(self) -> at.AuthToken:
        """Returns an active user token."""
        if not self.is_user_authenticated:
            self.login_user()
        return self.user_token

    def get_admin_token(self) -> at.AuthToken:
        """Returns an active admin token."""
        if not self.is_admin_authenticated:
            self.login_admin()
        return self.admin_token

    def authenticate(self) -> Dict[str, str]:
        """Create a dictionary with the current token to be used as a header."""
        if self.user_id:
            token = self.get_user_token()
        else:
            token = self.get_admin_token()

        return {"Authorization": f"token {token.access_token}"}

    def login_user(self) -> at.AuthToken:
        """Log into API

        Authenticate using settings credentials. If user_id, sudo as
        that user making API calls as if authenticated as user_id
        """
        if not self.is_user_authenticated:
            user_token = self._login_user()
            self.user_token = at.AuthToken(user_token)
        return self.user_token

    def login_admin(self) -> at.AuthToken:
        if not self.is_admin_authenticated:
            admin_token = self._login_admin()
            self.admin_token = at.AuthToken(admin_token)
        return self.admin_token

    def _login_admin(self) -> ml.AccessToken:
        serialized = urllib.parse.urlencode(
            {
                "client_id": self.settings.client_id,
                "client_secret": self.settings.client_secret,
            }
        ).encode("utf-8")

        response = self._ok(
            self.transport.request(tp.HttpMethod.POST, "/login", body=serialized)
        )

        admin_token = self.deserialize(response, ml.AccessToken)

        return admin_token

    def _login_user(self) -> ml.AccessToken:
        response = self._ok(
            self.transport.request(
                tp.HttpMethod.POST,
                f"/login/{self.user_id}",
                authenticator=lambda: {
                    "Authorization": f"token {self.get_admin_token().access_token}"
                },
            )
        )
        user_token = self.deserialize(response, ml.AccessToken)
        return user_token

    def logout(self) -> None:
        """Logs out all current active users
        """
        if self.is_user_authenticated:
            self._logout_user()
        if self.is_admin_authenticated:
            self._logout_admin()

    def _logout_user(self) -> None:
        self._ok(
            self.transport.request(
                tp.HttpMethod.DELETE,
                "/logout",
                authenticator=lambda: {
                    "Authorization": f"token {self.user_token.access_token}"
                },
            )
        )

        self._reset_user_token()

    def _logout_admin(self) -> None:
        self._ok(
            self.transport.request(
                tp.HttpMethod.DELETE,
                "/logout",
                authenticator=lambda: {
                    "Authorization": f"token {self.admin_token.access_token}"
                },
            )
        )

        self._reset_admin_token()

    def _reset_admin_token(self) -> None:
        self.admin_token = at.AuthToken()

    def _reset_user_token(self) -> None:
        self.user_token = at.AuthToken()

    def _ok(self, response: tp.Response) -> tp.TResponseValue:
        if not response.ok:
            raise UserSessionError(response.value)
        return response.value
