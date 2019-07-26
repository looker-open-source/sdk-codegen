"""Deserialize API response into models
"""

import json
from typing import Callable, List, Union

from looker.rtl import transport as tp


class SDKModel:  # pylint: disable=too-few-public-methods
    """Base SDK model

    TODO move into looker.sdk code
    """


class DeserializeError(Exception):
    """Improperly formatted data to deserialize.
    """


TDeserializeFunc = Callable[[tp.TResponseValue, SDKModel, bool],
                           Union[str, bytes, List[SDKModel], SDKModel]]
TDeserializeReturn = Union[str, bytes, List[SDKModel], SDKModel]


def deserialize(data: tp.TResponseValue, model: SDKModel,
                many: bool = False) -> TDeserializeReturn:
    """Translate API data into models.
    """
    try:
        data = json.loads(data)
    except json.JSONDecodeError:
        return data

    response: Union[List[SDKModel], SDKModel]
    if many:
        if not isinstance(data, list):
            raise DeserializeError('Require list data')
        response = []
        for datum in data:
            response.append(model(**datum))
    else:
        if not isinstance(data, dict):
            raise DeserializeError('Require dict data')
        response = model(**data)

    return response
