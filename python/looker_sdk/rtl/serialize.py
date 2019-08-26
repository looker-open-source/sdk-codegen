"""Deserialize API response into models
"""
import datetime
import functools
import json
import keyword

# ignoring "Module 'typing' has no attribute 'ForwardRef'"
from typing import (  # type: ignore
    Callable,
    ForwardRef,
    MutableMapping,
    Sequence,
    Type,
    Union,
)

import cattr

from looker_sdk.rtl import model
from looker_sdk.rtl import transport


class DeserializeError(Exception):
    """Improperly formatted data to deserialize.
    """


TModelOrSequence = Union[
    MutableMapping[str, str],
    Sequence[int],
    Sequence[str],
    model.Model,
    Sequence[model.Model],
]
TDeserializeReturn = TModelOrSequence
TStructure = Union[Type[Sequence[int]], Type[Sequence[str]], Type[TDeserializeReturn]]
TDeserialize = Callable[[transport.TResponseValue, TStructure], TDeserializeReturn]
TSerialize = Callable[[TModelOrSequence], bytes]


def deserialize(
    data: transport.TResponseValue, structure: TStructure
) -> TDeserializeReturn:
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


def serialize(api_model: TModelOrSequence) -> bytes:
    """Translate api_model into formdata encoded json bytes
    """
    data = cattr.unstructure(api_model)  # type: ignore
    return json.dumps(data).encode("utf-8")  # type: ignore


def structure_hook(context, data, type_):
    """cattr structure hook

    - Map reserved words in json keys to approriate (safe) names in model.
    - handle ForwardRef types until github.com/Tinche/cattrs/pull/42/ is fixed
       Note: this is the reason we need a "context" param and have to use a
       partial func to register the hook. Once the issue is resolved we can
       remove "context" and the partial.
    """
    for reserved in keyword.kwlist:
        if reserved in data:
            data[f"{reserved}_"] = data.pop(reserved)
    if isinstance(type_, ForwardRef):
        type_ = eval(type_.__forward_arg__, context, locals())
    instance = cattr.structure_attrs_fromdict(data, type_)
    return instance


def unstructure_hook(api_model):
    """cattr unstructure hook

    Map reserved_ words in models to correct json field names.
    Also handle stripping None fields from dict while setting
    EXPLICIT_NULL fields to None so that we only send null
    in the json for fields the caller set EXPLICIT_NULL on.
    """
    data = cattr.global_converter.unstructure_attrs_asdict(api_model)
    for key, value in data.copy().items():
        if value is None:
            del data[key]
        elif value == model.EXPLICIT_NULL:
            data[key] = None
    for reserved in keyword.kwlist:
        if f"{reserved}_" in data:
            data[reserved] = data.pop(f"{reserved}_")
    return data


structure_hook_func = functools.partial(structure_hook, globals())  # type: ignore
cattr.register_structure_hook(model.Model, structure_hook_func)  # type: ignore
cattr.register_structure_hook(
    datetime.datetime,
    lambda d, _: datetime.datetime.strptime(  # type: ignore
        d, "%Y-%m-%dT%H:%M:%S.%f%z"
    ),
)
cattr.register_unstructure_hook(model.Model, unstructure_hook)  # type: ignore
