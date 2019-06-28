import typing
import looker
from rtl.api_settings import ApiSettings
from rtl.user_session import UserSession

class SDKBase(object):
    def __init__(
        self,
        settings: ApiSettings = None,
        file_name: str = "looker.ini",
        user_session: UserSession = None,
        base_url: str = None,
        client_id: str = None,
        client_secret: str = None,
        api_version: str = None
        ):
        # cascade through settings initialization options
        self.settings: ApiSettings = ApiSettings(file_name) if settings is None else settings
        if api_version is not None:
            self.settings.api_version = api_version
        if base_url is not None:
            self.settings.base_url = base_url
        if client_id is not None:
            self.settings.client_id = client_id
        if client_secret is not None:
            self.client_secret = client_secret

        self.manage_user: bool = user_session is None
        self.user_session: UserSession = UserSession(self.settings) if user_session is None else user_session
   )

    # Implement destructor support
    def __enter__(self):
        if self.manager_user:
            self.user_session.login()
        return self
    
    # Implement destructor support
    def __exit__(self, exc_type, exc_value, traceback):
        if self.manage_user:
            self.logout()
    
    def login(self) -> looker.models.access_token:
        return self.user_session.login()
    
    def logout(self):
        self.user_session.logout()