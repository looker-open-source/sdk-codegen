from looker.sdk.models import AccessToken
import datetime
from typing import Optional


class AuthToken(object):
    def __init__(self, token: Optional[AccessToken] = None):
        self.access_token: str = ''
        self.token_type: str = ''
        self.expires_in: int = ''
        self.expires_at = datetime.datetime.now()
        if token is None:
            token = AccessToken()
        self.set_token(token)

    def set_token(self, token: AccessToken):
        """Assign the token and set its expiration."""
        self.access_token = token.access_token or ''
        self.token_type = token.token_type or ''
        self.expires_in = token.expires_in or 0

        exp = datetime.datetime.now()

        if (token.access_token and token.expires_in):
            exp = exp + datetime.timedelta(seconds=token.expires_in)
        else:
            # set to expire 10 seconds ago
            exp = exp + datetime.timedelta(seconds=-10)
        self.expires_at = exp
        return

    @property
    def is_active(self) -> bool:
        """True if authentication token has not timed out"""
        if not self.expires_at:
            return False
        return self.expires_at > datetime.datetime.now()
