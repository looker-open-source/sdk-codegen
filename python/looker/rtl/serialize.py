"""Deserialize API response into models
"""

import json
import keyword
from typing import Callable, Dict, List, Sequence, Type, Union

import cattr

from looker.rtl import model as ml
from looker.rtl import transport as tp


class DeserializeError(Exception):
    """Improperly formatted data to deserialize.
    """


TModelOrSequence = Union[ml.Model, Sequence[ml.Model]]
TDeserializeReturn = TModelOrSequence
TStructure = Union[Type[Sequence[int]], Type[Sequence[str]], Type[TDeserializeReturn]]
TDeserialize = Callable[[tp.TResponseValue, TStructure], TDeserializeReturn]
TSerialize = Callable[[TModelOrSequence], bytes]


def deserialize(data: tp.TResponseValue, structure: TStructure) -> TDeserializeReturn:
    """Translate API data into models.
    """
    try:
        data = json.loads(data)
    except json.JSONDecodeError:
        raise DeserializeError("Bad data")
    try:
        response: TDeserializeReturn = cattr.structure(data, structure)  # type: ignore
    except (TypeError, AttributeError):
        raise DeserializeError("Bad data")
    return response


def serialize(model: TModelOrSequence) -> bytes:
    """Translate model into formdata encoded json bytes
    """
    data: Dict[
        str, Union[str, int, bool, ml.Model, List[Union[str, int, bool, ml.Model]]]
    ] = cattr.unstructure(model)
    return json.dumps(data).encode("utf-8")


def keyword_field_structure_hook(data: Dict, type_: TDeserializeReturn):
    """cattr structure hook

    Map reserved words in json keys to approriate (safe) names in model.
    """
    for reserved in keyword.kwlist:

        if reserved in data:  # type: ignore
            data[f"{reserved}_"] = data.pop(reserved)  # type: ignore
    return cattr.structure_attrs_fromdict(data, type_)  # type: ignore


def keyword_field_unstructure_hook(model: ml.Model):
    """cattr unstructure hook

    Map reserved_ words in models to correct json field names.
    """
    data = cattr.global_converter.unstructure_attrs_asdict(  # type: ignore
        model
    )
    for reserved in keyword.kwlist:
        if f"{reserved}_" in data:  # type: ignore
            data[reserved] = data.pop(f"{reserved}_")  # type: ignore
    return data  # type: ignore
