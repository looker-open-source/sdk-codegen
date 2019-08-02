"""Base model and other model(s) the RTL relies on.
"""

import attr


class Model:
    """Base model for all API models.
    """


@attr.s(auto_attribs=True)
class AccessToken(Model):
    """API Model used by RTL UserSession

    Attributes:
        access_token : Access Token used for API calls
        token_type : Type of Token
        expires_in : Number of seconds before the token expires
    """

    # Access Token used for API calls
    access_token: str = ""
    # Type of Token
    token_type: str = ""
    # Number of seconds before the token expires
    expires_in: int = 0
