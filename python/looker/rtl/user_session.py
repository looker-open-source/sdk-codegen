from looker.sdk.models import
import datetime
# import urllib3
from api_settings import ApiSettings
from sdk_error import SDKError


class UserSession(object):

    def __init__(self, settings: ApiSettings = None):
        """Authenticate and (optionally) Login user"""
        self._settings: ApiSettings = ApiSettings() if settings is None else settings
        self._client_config: looker.Configuration = None
        self._api_client: looker.ApiClient = None
        self._auth_api: looker.ApiAuthApi = None
        self._dashboard_api: looker.DashboardApi = None
        self._look_api: looker.LookApi = None
        self._user_api: looker.UserApi = None
        self._space_api: looker.SpaceApi = None
        self._query_api: looker.QueryApi = None
        self._user_id: str = None
        self._token_expires_at: datetime = None
        self._token: looker.models.access_token = None
        self._user_token: looker.models.access_token = None
        self._me: looker.models.user = None

    @property
    def settings(self) -> ApiSettings:
        return self._settings

    @settings.setter
    def settings(self, value: ApiSettings):
        self._settings = value

    @property
    def token(self) -> looker.models.access_token:
        return self._token

    @token.setter
    def token(self, value):
        if self.token == value:
            return  # No need to reset anything
        self.reset()
        self._token = value
        self.set_auth_expiration(value)

    @property
    def api_client(self) -> looker.ApiClient:
        """Returns active Api Client, logging back in if the auth token has expired"""
        if not self.is_authenticated():
            self.login()
        return self._api_client

    @api_client.setter
    def api_client(self, value):
        self._api_client = value

    @property
    def client_config(self) -> looker.Configuration:
        if self._client_config is None:
            self._client_config = looker.Configuration()
            self.client_config.host = self.settings.url
            self.client_config.verify_ssl = self.settings.verify_ssl
            # if not self.settings.verify_ssl:
            #     urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        return self._client_config

    @client_config.setter
    def client_config(self, value):
        self._client_config = value

    @property
    def auth_api(self) -> looker.ApiAuthApi:
        """Authentication API assigned on demand"""
        if self._auth_api is None:
            self._auth_api = looker.ApiAuthApi(self.api_client)
        return self._auth_api

    @property
    def dashboard_api(self) -> looker.DashboardApi:
        """Dashboard API assigned on demand"""
        if self._dashboard_api is None:
            self._dashboard_api = looker.DashboardApi(self.api_client)
        return self._dashboard_api

    @property
    def user_api(self) -> looker.UserApi:
        """User API assigned on demand"""
        if self._user_api is None:
            self._user_api = looker.UserApi(self.api_client)
        return self._user_api

    @property
    def look_api(self) -> looker.LookApi:
        """Look API assigned on demand"""
        if self._look_api is None:
            self._look_api = looker.LookApi(self.api_client)
        return self._look_api

    @property
    def space_api(self) -> looker.SpaceApi:
        """Space API assigned on demand"""
        if self._space_api is None:
            self._space_api = looker.SpaceApi(self.api_client)
        return self._space_api

    @property
    def query_api(self) -> looker.QueryApi:
        """Query API assigned on demand"""
        if self._query_api is None:
            self._query_api = looker.QueryApi(self.api_client)
        return self._query_api

    @property
    def me(self) -> looker.models.user:
        """Current user's identity. read-only, determined by login"""
        if self._me is None:
            self._me = self.user_api.me()
        return self._me

    @property
    def user_id(self) -> str:
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        self._user_id = value

    @property
    def user_token(self) -> looker.models.access_token:
        return self._user_token

    @property
    def token_expires_at(self) -> datetime:
        return self._token_expires_at

    def reset(self):
        """Reset all session APIs and user token"""
        self._token = None
        self._token_expires_at = None
        self._api_client = None
        self._user_token = None
        self._auth_api = None
        self._dashboard_api = None
        self._user_api = None
        self._look_api = None
        self._me = None
        self._user_id = None
        self._user_token = None
        self._space_api = None
        self._query_api = None

    def set_auth_expiration(self, auth_token: looker.models.access_token):
        if auth_token is None:
            self._token_expires_at = datetime.datetime.now()
        else:
            self._token_expires_at = datetime.datetime.now() + datetime.timedelta(0, auth_token.expires_in)
        return self._token_expires_at

    def active_token(self) -> looker.models.access_token:
        """Returns either the client token, or the user token if impersonating"""
        if self.user_token is None:
            return self.token
        return self.user_token

    def impersonating(self) -> bool:
        return self.user_token is not None

    def is_authenticated(self) -> bool:
        """Determines if the authentication token exists and has not expired"""
        if self._api_client is None:
            return False
        if self.active_token() is None:
            return False
        if self.token_expires_at is None:
            return False
        return self.token_expires_at > datetime.datetime.now()

    def assign_api_client(self, auth_token: looker.models.access_token = None):
        if auth_token is None:
            auth_token = self.active_token()
        # set the ApiClient ref for this user so all other apis can be determined
        self.api_client = looker.ApiClient(self.client_config, 'Authorization', 'token '
                                           + auth_token.access_token)

    def _login(self) -> looker.models.access_token:
        """Internal login method"""
        self.reset()

        # instantiate Auth API
        unauthenticated_client = looker.ApiClient(configuration=self.client_config)
        unauthenticated_auth_api = looker.ApiAuthApi(unauthenticated_client)

        # authenticate client
        self.token = unauthenticated_auth_api.login(client_id=self.settings.client_id,
                                                    client_secret=self.settings.client_secret)

        if self.token is None:
            raise SDKError(403, "Login to {} failed".format(self.settings.base_url))

        self.assign_api_client()
        return self.active_token()

    def login(self, settings=None) -> looker.models.access_token:
        """Authenticate and login user to the API with default or specified settings"""
        if settings is not None:
            self.settings = settings

        self._login()

        if self.settings.user_id:
            self.login_user(self.settings.user_id)

        return self.active_token()

    def logout(self):
        """Logs out the active user. If impersonating, logs out impersonated user and logs
        in with client_id and client_secret
        """
        if self.is_authenticated():
            self.auth_api.logout()
            if self.impersonating():
                # clear impersonation settings
                self._user_id = None
                self._user_token = None
                # log back in using client id and secret only
                self._login()
            else:
                self.reset()

    def login_user(self, user_id) -> looker.models.access_token:
        self.user_id = user_id
        self._user_token = self.auth_api.login_user(user_id)
        if self._user_token is not None:
            self.assign_api_client(self.user_token)
            self.set_auth_expiration(self.user_token)
        return self.active_token()

    def logout_user(self):
        if self.user_id is None:
            raise SDKError("No user impersonation is active")
        return self.api_client.logout()


if __name__ == "__main__":
    session = UserSession()
    token: looker.models.access_token = session.login()
    print(session.me)
    print(token)
    session.logout()
