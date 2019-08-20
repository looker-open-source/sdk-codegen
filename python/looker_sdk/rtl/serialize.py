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
    Sequence,
    Type,
    Union,
)

import cattr

from looker_sdk.rtl import model as ml
from looker_sdk.rtl import transport as tp


class DeserializeError(Exception):
    """Improperly formatted data to deserialize.
    """


TModelOrSequence = Union[Sequence[int], Sequence[str], ml.Model, Sequence[ml.Model]]
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
    data = cattr.unstructure(model)  # type: ignore
    return json.dumps(data).encode("utf-8")  # type: ignore


def structure_hook(context, data, type_):
    """cattr structure hook

    1/ Map reserved words in json keys to approriate (safe) names in model.
    2/ convert _NULL_INIT fields to None: a side effect of cattr.structure
       instantiating the model object we set everything _NULL_INIT and None
       is a cleaner value for the "null"/"non-present" fields in these
       returned objects
    3/ handle ForwardRef types until github.com/Tinche/cattrs/pull/42/ is fixed
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
    for key, value in instance.__dict__.copy().items():
        if value == ml._NULL_INIT:
            setattr(instance, key, None)
    return instance


def unstructure_hook(model):
    """cattr unstructure hook

    Map reserved_ words in models to correct json field names.
    Also handle stripping _NULL_INIT fields from json while setting
    EXPLICIT_NULL fields to None
    """
    data = cattr.global_converter.unstructure_attrs_asdict(model)
    for key, value in data.copy().items():
        if value == ml._NULL_INIT:
            del data[key]
        elif value == ml.EXPLICIT_NULL:
            data[key] = None
    for reserved in keyword.kwlist:
        if f"{reserved}_" in data:
            data[reserved] = data.pop(f"{reserved}_")
    return data


structure_hook_func = functools.partial(structure_hook, globals())  # type: ignore
cattr.register_structure_hook(ml.Model, structure_hook_func)  # type: ignore
cattr.register_structure_hook(
    datetime.datetime,
    lambda d, _: datetime.datetime.strptime(  # type: ignore
        d, "%Y-%m-%dT%H:%M:%S.%f%z"
    ),
)
cattr.register_unstructure_hook(ml.Model, unstructure_hook)  # type: ignore
