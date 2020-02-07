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
TDeserialize = Callable[[str, TStructure], TDeserializeReturn]
TSerialize = Callable[[TModelOrSequence], bytes]


def deserialize(
    *, data: str, structure: TStructure, converter: cattr.Converter
) -> TDeserializeReturn:
    """Translate API data into models.
    """
    try:
        data = json.loads(data)
    except json.JSONDecodeError as ex:
        raise DeserializeError(f"Bad json {ex}")
    try:
        response: TDeserializeReturn = converter.structure(  # type: ignore
            data, structure
        )
    except (TypeError, AttributeError) as ex:
        raise DeserializeError(f"Bad data {ex}")
    return response


converter31 = cattr.Converter()
deserialize31 = functools.partial(deserialize, converter=converter31)
converter40 = cattr.Converter()
deserialize40 = functools.partial(deserialize, converter=converter40)


def serialize(api_model: TModelOrSequence) -> bytes:
    """Translate api_model into formdata encoded json bytes
    """
    data = cattr.unstructure(api_model)  # type: ignore
    return json.dumps(data).encode("utf-8")  # type: ignore


def structure_hook(context, converter, data, type_):
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
    instance = converter.structure_attrs_fromdict(data, type_)
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


# structure_hook_func = functools.partial(structure_hook, globals())  # type: ignore
# cattr.register_structure_hook(model.Model, structure_hook_func)  # type: ignore
converter31.register_structure_hook(
    datetime.datetime,
    lambda d, _: datetime.datetime.strptime(  # type: ignore
        d, "%Y-%m-%dT%H:%M:%S.%f%z"
    ),
)
converter40.register_structure_hook(
    datetime.datetime,
    lambda d, _: datetime.datetime.strptime(  # type: ignore
        d, "%Y-%m-%dT%H:%M:%S.%f%z"
    ),
)
cattr.register_unstructure_hook(model.Model, unstructure_hook)  # type: ignore
