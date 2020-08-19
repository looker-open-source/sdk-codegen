# The MIT License (MIT)
#
# Copyright (c) 2019 Looker Data Sciences, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

"""AuthSession to provide automatic authentication
"""
import hashlib
import secrets
from typing import cast, Dict, Optional, Type, Union
import urllib.parse

import attr

from looker_sdk import error
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import auth_token
from looker_sdk.rtl import model
from looker_sdk.rtl import serialize
from looker_sdk.rtl import transport
from looker_sdk.sdk.api31 import models as models31
from looker_sdk.sdk.api40 import models as models40


token_model_isinstances = models31.AccessToken, models40.AccessToken


class AuthSession:
    """AuthSession to provide automatic authentication
    """

    def __init__(
        self,
        settings: api_settings.PApiSettings,
        transport: transport.Transport,
        deserialize: serialize.TDeserialize,
        version: str,
    ):
        if not settings.is_configured():
            raise error.SDKError(
                "Missing required configuration values like base_url and api_version."
            )
        self.settings = settings
        self.sudo_token: auth_token.AuthToken = auth_token.AuthToken()
        self.token: auth_token.AuthToken = auth_token.AuthToken()
        self._sudo_id: Optional[int] = None
        self.transport = transport
        self.deserialize = deserialize
        self.version = version
        self.token_model: Union[Type[models31.AccessToken], Type[models40.AccessToken]]
        if self.version == "3.1":
            self.token_model = models31.AccessToken
        elif self.version == "4.0":
            self.token_model = models40.AccessToken

    def _is_authenticated(self, token: auth_token.AuthToken) -> bool:
        """Determines if current token is active."""
        if not (token.access_token):
            return False
        return token.is_active

    @property
    def is_sudo_authenticated(self) -> bool:
        return self._is_authenticated(self.sudo_token)

    @property
    def is_authenticated(self) -> bool:
        return self._is_authenticated(self.token)

    def _get_sudo_token(self) -> auth_token.AuthToken:
        """Returns an active sudo token."""
        if not self.is_sudo_authenticated:
            self._login_sudo()
        return self.sudo_token

    def _get_token(self) -> auth_token.AuthToken:
        """Returns an active token."""
        if not self.is_authenticated:
            self._login()
        return self.token

    def authenticate(self) -> Dict[str, str]:
        """Return the Authorization header to authenticate each API call.

        Expired token renewal happens automatically.
        """
        if self._sudo_id:
            token = self._get_sudo_token()
        else:
            token = self._get_token()

        return {"Authorization": f"Bearer {token.access_token}"}

    def login_user(self, sudo_id: int) -> None:
        """Authenticate using settings credentials and sudo as sudo_id.

        Make API calls as if authenticated as sudo_id. The sudo_id
        token is automatically renewed when it expires. In order to
        subsequently login_user() as another user you must first logout()
        """
        if self._sudo_id is None:
            self._sudo_id = sudo_id
            try:
                self._login_sudo()
            except error.SDKError:
                self._sudo_id = None
                raise

        else:
            if self._sudo_id != sudo_id:
                raise error.SDKError(
                    f"Another user ({self._sudo_id}) "
                    "is already logged in. Log them out first."
                )
            elif not self.is_sudo_authenticated:
                self._login_sudo()

    def _login(self) -> None:
        client_id = self.settings.read_config().get("client_id")
        client_secret = self.settings.read_config().get("client_secret")
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
                f"{self.settings.base_url}/api/{self.version}/login",
                body=serialized,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
        )

        # ignore type: mypy bug doesn't recognized kwarg `structure` to partial func
        access_token = self.deserialize(
            data=response, structure=self.token_model
        )  # type: ignore
        assert isinstance(access_token, token_model_isinstances)
        self.token = auth_token.AuthToken(access_token)

    def _login_sudo(self) -> None:
        response = self._ok(
            self.transport.request(
                transport.HttpMethod.POST,
                f"{self.settings.base_url}/api/{self.version}/login/{self._sudo_id}",
                authenticator=lambda: {
                    "Authorization": f"Bearer {self._get_token().access_token}"
                },
            )
        )
        # ignore type: mypy bug doesn't recognized kwarg `structure` to partial func
        access_token = self.deserialize(
            data=response, structure=self.token_model
        )  # type: ignore
        assert isinstance(access_token, token_model_isinstances)
        self.sudo_token = auth_token.AuthToken(access_token)

    def logout(self, full: bool = False) -> None:
        """Logout of API.

        If the session is authenticated as sudo_id, logout() "undoes"
        the sudo and deactivates that sudo_id's current token. By default
        the current api3credential session is active at which point
        you can continue to make API calls as the api3credential user
        or logout(). If you want to logout completely in one step pass
        full=True
        """
        if self._sudo_id:
            self._sudo_id = None
            if self.is_sudo_authenticated:
                self._logout(sudo=True)
                if full:
                    self._logout()

        elif self.is_authenticated:
            self._logout()

    def _logout(self, sudo: bool = False) -> None:

        if sudo:
            token = self.sudo_token.access_token
            self.sudo_token = auth_token.AuthToken()
        else:
            token = self.token.access_token
            self.token = auth_token.AuthToken()

        self._ok(
            self.transport.request(
                transport.HttpMethod.DELETE,
                f"{self.settings.base_url}/api/logout",
                authenticator=lambda: {"Authorization": f"Bearer {token}"},
            )
        )

    def _ok(self, response: transport.Response) -> str:
        if not response.ok:
            raise error.SDKError(response.value)
        return response.value.decode(encoding="utf-8")


class CryptoHash:
    def secure_random(self, byte_count: int) -> str:
        return secrets.token_urlsafe(byte_count)

    def sha256_hash(self, message: str) -> str:
        value = hashlib.sha256()
        value.update(bytes(message, "utf8"))
        return value.hexdigest()


class OAuthSession(AuthSession):
    def __init__(
        self,
        *,
        settings: api_settings.PApiSettings,
        transport: transport.Transport,
        deserialize: serialize.TDeserialize,
        serialize: serialize.TSerialize,
        crypto: CryptoHash,
        version: str,
    ):
        super().__init__(settings, transport, deserialize, version)
        self.crypto = crypto
        self.serialize = serialize
        config_data = self.settings.read_config()
        for required in ["client_id", "redirect_uri", "looker_url"]:
            if required not in config_data:
                raise error.SDKError(f"Missing required configuration value {required}")

        # would have prefered using setattr(self, required, ...) in loop above
        # but mypy can't follow it
        self.client_id = config_data["client_id"]
        self.redirect_uri = config_data["redirect_uri"]
        self.looker_url = config_data["looker_url"]
        self.code_verifier = ""

    def create_auth_code_request_url(self, scope: str, state: str) -> str:
        self.code_verifier = self.crypto.secure_random(32)
        code_challenge = self.crypto.sha256_hash(self.code_verifier)
        params: Dict[str, str] = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": scope,
            "state": state,
            "code_challenge_method": "S256",
            "code_challenge": code_challenge,
        }
        path = urllib.parse.urljoin(self.looker_url, "auth")
        query = urllib.parse.urlencode(params)
        return f"{path}?{query}"

    @attr.s(auto_attribs=True, kw_only=True)
    class GrantTypeParams(model.Model):
        client_id: str
        redirect_uri: str

    @attr.s(auto_attribs=True, kw_only=True)
    class AuthCodeGrantTypeParams(GrantTypeParams):
        code: str
        code_verifier: str
        grant_type: str = "authorization_code"

    @attr.s(auto_attribs=True, kw_only=True)
    class RefreshTokenGrantTypeParams(GrantTypeParams):
        refresh_token: str
        grant_type: str = "refresh_token"

    def _request_token(
        self, grant_type: Union[AuthCodeGrantTypeParams, RefreshTokenGrantTypeParams]
    ) -> Union[models31.AccessToken, models40.AccessToken]:
        response = self.transport.request(
            transport.HttpMethod.POST,
            urllib.parse.urljoin(self.settings.base_url, "/api/token"),
            body=self.serialize(grant_type),
        )
        if not response.ok:
            raise error.SDKError(response.value.decode(encoding=response.encoding))

        # ignore type: mypy bug doesn't recognized kwarg `structure` to partial func
        return self.deserialize(
            data=response.value, structure=self.token_model
        )  # type: ignore

    def redeem_auth_code(
        self, auth_code: str, code_verifier: Optional[str] = None
    ) -> None:
        params = self.AuthCodeGrantTypeParams(
            client_id=self.client_id,
            redirect_uri=self.redirect_uri,
            code=auth_code,
            code_verifier=code_verifier or self.code_verifier,
        )

        access_token = self._request_token(params)
        self.token = auth_token.AuthToken(access_token)

    def _login(self) -> None:
        params = self.RefreshTokenGrantTypeParams(
            client_id=self.client_id,
            redirect_uri=self.redirect_uri,
            refresh_token=self.token.refresh_token,
        )
        access_token = self._request_token(params)
        self.token = auth_token.AuthToken(access_token)
