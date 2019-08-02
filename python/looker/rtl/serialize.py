"""Deserialize API response into models
"""

import urllib.parse
import json
import keyword
from typing import Callable, Dict, List, Type, Union

import cattr

from looker.rtl import transport as tp


class SDKModel:  # pylint: disable=too-few-public-methods
    """Base SDK model

    TODO move into looker.sdk code
    """


class DeserializeError(Exception):
    """Improperly formatted data to deserialize.
    """


TStructure = Union[Type[SDKModel], List[Type[SDKModel]]]
TDeserializeReturn = Union[str, bytes, SDKModel, List[SDKModel]]
TDeserialize = Callable[[tp.TResponseValue, TStructure], TDeserializeReturn]


def deserialize(data: tp.TResponseValue,
                structure: TStructure) -> TDeserializeReturn:
    """Translate API data into models.
    """
    try:
        data = json.loads(data)
    except json.JSONDecodeError:
        return data
    try:
        response: Union[List[SDKModel], SDKModel] = cattr.structure(
            data, structure)
    except (TypeError, AttributeError):
        raise DeserializeError('Bad data')
    return response


TSerialize = Callable[[SDKModel], bytes]


def serialize(model: SDKModel) -> bytes:
    """Translate model into formdata encoded json bytes
    """
    data: Dict[str, Union[str, int, bool, SDKModel, List[
        Union[str, int, bool, SDKModel]]]] = cattr.unstructure(model)
    return urllib.parse.urlencode(data).encode('utf-8')


def keyword_field_structure_hook(data: Dict,
                                 type_: Union[SDKModel, List[SDKModel]]):
    """cattr structure hook

    Map reserved words in json keys to approriate (safe) names in model.
    """
    for reserved in keyword.kwlist:

        if reserved in data:  # type: ignore
            data[f'{reserved}_'] = data.pop(reserved)  # type: ignore
    return cattr.structure_attrs_fromdict(data, type_)  # type: ignore


def keyword_field_unstructure_hook(model: SDKModel):
    """cattr unstructure hook

    Map reserved_ words in models to correct json field names.
    """
    data = cattr.global_converter.unstructure_attrs_asdict(  # type: ignore
        model)
    for reserved in keyword.kwlist:
        if f'{reserved}_' in data:  # type: ignore
            data[reserved] = data.pop(f'{reserved}_')  # type: ignore
    return data  # type: ignore
