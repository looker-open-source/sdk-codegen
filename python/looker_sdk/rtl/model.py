"""Base model for all generated models
"""

from typing import Any, cast


EXPLICIT_NULL = cast(Any, "EXPLICIT_NULL")  # type:ignore


class Model:
    """Base model for all generated models.
    """

    def __attrs_post_init__(self):
        """All model fields are default None.

        When we destructure a model into json we don't want to send
        fields that are set to None just because the model was
        instantiated. This post init hook resets all default None values
        to a sentinel _NULL_INIT value so that the unstructure hook can
        omit the field from the json.

        If a caller wishes to explicitly update an API resource field to
        None/null there are two methods:

        1/ instantiate the object, then set the field to None or EXPLICIT_NULL
           e.g
           model = Model()
           model.field = None  # or model.field = EXPLICIT_NULL
        2/ pass in the field to the class constructor with a value of
           EXPLICIT_NULL e.g. Model(field=EXPLICIT_NULL)

        Either of these approaches will result in the API resource field
        being updated to None/null
        """
        for key, value in dict(self.__dict__).items():
            if value is None:
                setattr(self, key, _NULL_INIT)
            elif value == EXPLICIT_NULL:
                setattr(self, key, None)
