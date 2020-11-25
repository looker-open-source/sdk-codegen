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

"""AuthToken
"""
from typing import Optional, Type, Union
import datetime

import attr

from looker_sdk.rtl import auth_session
from looker_sdk.rtl import model


#  Same as the Looker API access token object
#  Re-declared here to be independent of model generation
@attr.s(auto_attribs=True, init=False)
class AccessToken(model.Model):
    """
    Attributes:
        access_token: Access Token used for API calls
        token_type: Type of Token
        expires_in: Number of seconds before the token expires
        refresh_token: Refresh token which can be used to obtain a new access token
    """

    access_token: Optional[str] = None
    token_type: Optional[str] = None
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None

    def __init__(
        self,
        *,
        access_token: Optional[str] = None,
        token_type: Optional[str] = None,
        expires_in: Optional[int] = None,
        refresh_token: Optional[str] = None,
    ):
        self.access_token = access_token
        self.token_type = token_type
        self.expires_in = expires_in
        self.refresh_token = refresh_token


class AuthToken:
    """Used to instantiate or check expiry of an AccessToken object"""

    def __init__(
        self, token: Optional[AccessToken] = None,
    ):
        self.lag_time = 10
        self.access_token: str = ""
        self.refresh_token: str = ""
        self.token_type: str = ""
        self.expires_in: int = 0
        self.expires_at = datetime.datetime.now() + datetime.timedelta(
            seconds=-self.lag_time
        )
        if token is None:
            token = AccessToken()
        self.set_token(token)

    def set_token(self, token: AccessToken):
        """Assign the token and set its expiration."""
        self.access_token = token.access_token or ""
        if isinstance(token, AccessToken):
            self.refresh_token = token.refresh_token or ""
        self.token_type = token.token_type or ""
        self.expires_in = token.expires_in or 0

        lag = datetime.timedelta(seconds=-self.lag_time)
        if token.access_token and token.expires_in:
            lag = datetime.timedelta(seconds=token.expires_in - self.lag_time)
        self.expires_at = datetime.datetime.now() + lag

    @property
    def is_active(self) -> bool:
        """True if authentication token has not timed out"""
        if not self.expires_at:
            return False
        return self.expires_at > datetime.datetime.now()
