"""Base model and other model(s) the RTL relies on.
"""

import attr


_NULL_INIT = "NULL_INIT"


class Model:
    """Base model for all API models.
    """

    def __attrs_post_init__(self):
        """All model fields are default None.

        When we destructure a model into json we don't want to send
        fields that are set to None just because the model was
        instantiated. Setting to a sentinel value here allows
        the unstructure hook to omit the field from the json. Only
        fields that a caller has explicitly set to None on the instance
        will be sent in the json.
        """
        for key, value in dict(self.__dict__).items():
            if value is None:
                setattr(self, key, _NULL_INIT)


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
