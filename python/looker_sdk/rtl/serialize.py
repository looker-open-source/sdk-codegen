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
import enum
import functools
import json
import keyword
import sys
from typing import (
    Callable,
    MutableMapping,
    Sequence,
    Type,
    Union,
)

import cattr

from looker_sdk.rtl import model, hooks


class DeserializeError(Exception):
    """Improperly formatted data to deserialize."""


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
    """Translate API data into models."""
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


def serialize(*, api_model: TModelOrSequence, converter: cattr.Converter) -> bytes:
    """Translate api_model into formdata encoded json bytes"""
    data = converter.unstructure(api_model)  # type: ignore
    return json.dumps(data,default=lambda o: o.__dict__).encode("utf-8")  # type: ignore


def forward_ref_structure_hook(context, converter, data, forward_ref):
    """Applied to ForwardRef model and enum annotations

    - Map reserved words in json keys to approriate (safe) names in model.
    - handle ForwardRef types until github.com/Tinche/cattrs/pull/42/ is fixed
       Note: this is the reason we need a "context" param and have to use a
       partial func to register the hook. Once the issue is resolved we can
       remove "context" and the partial.
    """
    data = hooks.tr_data_keys(data)
    actual_type = eval(forward_ref.__forward_arg__, context, locals())
    if issubclass(actual_type, enum.Enum):
        instance = converter.structure(data, actual_type)
    elif issubclass(actual_type, model.Model):
        # cannot use converter.structure - recursion error
        instance = converter.structure_attrs_fromdict(data, actual_type)
    else:
        raise DeserializeError(f"Unknown type to deserialize: {actual_type}")
    return instance


def translate_keys_structure_hook(converter, data, model_type):
    """Applied only to models.Model"""
    new_data = hooks.tr_data_keys(data)
    ret = converter.structure_attrs_fromdict(new_data, model_type)
    return ret

converter40 = cattr.Converter()
deserialize40 = functools.partial(deserialize, converter=converter40)
serialize40 = functools.partial(serialize, converter=converter40)

converter40.register_structure_hook(datetime.datetime, hooks.datetime_structure_hook)
unstructure_hook40 = functools.partial(hooks.unstructure_hook, converter40)  # type: ignore
converter40.register_unstructure_hook(model.Model, unstructure_hook40)  # type: ignore
converter40.register_unstructure_hook(
    datetime.datetime, hooks.datetime_unstructure_hook  # type: ignore
)
