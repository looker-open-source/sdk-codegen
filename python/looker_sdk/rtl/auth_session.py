"""AuthSession to provide automatic authentication
"""
import os
from typing import cast, Dict, Optional
import urllib.parse

from looker_sdk import error
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import auth_token
from looker_sdk.rtl import transport
from looker_sdk.rtl import serialize
from looker_sdk.sdk import models


class AuthSession:
    """AuthSession to provide automatic authentication
    """

    def __init__(
        self,
        settings: api_settings.ApiSettings,
        transport: transport.Transport,
        deserialize: serialize.TDeserialize,
    ):
        self.user_token: auth_token.AuthToken = auth_token.AuthToken()
        self.admin_token: auth_token.AuthToken = auth_token.AuthToken()
        self._sudo_id: Optional[int] = None
        self.settings = settings
        self.transport = transport
        self.deserialize = deserialize

    def _is_authenticated(self, token: auth_token.AuthToken) -> bool:
        """Determines if current token is active."""
        if not (token.access_token):
            return False
        return token.is_active

    @property
    def is_user_authenticated(self) -> bool:
        return self._is_authenticated(self.user_token)

    @property
    def is_admin_authenticated(self) -> bool:
        return self._is_authenticated(self.admin_token)

    @property
    def is_sudo(self) -> Optional[int]:
        return self._sudo_id

    def _get_user_token(self) -> auth_token.AuthToken:
        """Returns an active user token."""
        if not self.is_user_authenticated:
            self._login_user()
        return self.user_token

    def _get_admin_token(self) -> auth_token.AuthToken:
        """Returns an active admin token."""
        if not self.is_admin_authenticated:
            self._login_admin()
        return self.admin_token

    def authenticate(self) -> Dict[str, str]:
        """Return the Authorization header to authenticate each API call.

        Expired token renewal happens automatically.
        """
        if self._sudo_id:
            token = self._get_user_token()
        else:
            token = self._get_admin_token()

        return {"Authorization": f"token {token.access_token}"}

    def login_user(self, sudo_id: int) -> None:
        """Authenticate using settings credentials and sudo as sudo_id.

        Make API calls as if authenticated as sudo_id. The sudo_id
        token is automatically renewed when it expires. In order to
        subsequently login_user() as another user you must first logout()
        """
        if self._sudo_id is None:
            self._sudo_id = sudo_id
            try:
                self._login_user()
            except error.SDKError:
                self._sudo_id = None
                raise

        else:
            if self._sudo_id != sudo_id:
                raise error.SDKError(
                    f"Another user ({self._sudo_id}) "
                    "is already logged in. Log them out first."
                )
            elif not self.is_user_authenticated:
                self._login_user()

    def _login_admin(self) -> None:
        config_data = self.settings.read_ini(
            self.settings._filename, self.settings._section
        )
        client_id = os.getenv("LOOKER_CLIENT_ID") or config_data.get("client_id")
        client_secret = os.getenv("LOOKER_CLIENT_SECRET") or config_data.get(
            "client_secret"
        )

        if not (client_id and client_secret):
            raise error.SDKError("Required auth credentials not found.")

        serialized = urllib.parse.urlencode(
            {
                "client_id": cast(str, client_id),
                "client_secret": cast(str, client_secret),
            }
        ).encode("utf-8")

        response = self._ok(
            self.transport.request(
                transport.HttpMethod.POST,
                "/login",
                body=serialized,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
        )

        access_token = self.deserialize(response, models.AccessToken)
        assert isinstance(access_token, models.AccessToken)
        self.admin_token = auth_token.AuthToken(access_token)

    def _login_user(self) -> None:
        response = self._ok(
            self.transport.request(
                transport.HttpMethod.POST,
                f"/login/{self._sudo_id}",
                authenticator=lambda: {
                    "Authorization": f"token {self._get_admin_token().access_token}"
                },
            )
        )
        access_token = self.deserialize(response, models.AccessToken)
        assert isinstance(access_token, models.AccessToken)
        self.user_token = auth_token.AuthToken(access_token)

    def logout(self, full: bool = False) -> None:
        """Logout cuurent session or all.

        If the session is authenticated as sudo_id, logoout() "undoes"
        the sudo and deactivates that sudo_id's current token. By default
        the current admin/api3credential session is active at which point
        you can continue to make API calls as the admin/api3credential user
        or logout(). If you want to logout completely in one step pass
        full=True
        """
        if self._sudo_id:
            self._sudo_id = None
            if self.is_user_authenticated:
                self._logout_user()
                if full:
                    self._logout_admin()

        elif self.is_admin_authenticated:
            self._logout_admin()

    def _logout_user(self) -> None:
        self._ok(
            self.transport.request(
                transport.HttpMethod.DELETE,
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
                transport.HttpMethod.DELETE,
                "/logout",
                authenticator=lambda: {
                    "Authorization": f"token {self.admin_token.access_token}"
                },
            )
        )

        self._reset_admin_token()

    def _reset_admin_token(self) -> None:
        self.admin_token = auth_token.AuthToken()

    def _reset_user_token(self) -> None:
        self.user_token = auth_token.AuthToken()

    def _ok(self, response: transport.Response) -> transport.TResponseValue:
        if not response.ok:
            raise error.SDKError(response.value)
        return response.value
