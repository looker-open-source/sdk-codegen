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

import copy
import enum
import functools
import json

# ignoring "Module 'typing' has no attribute 'ForwardRef'"
from typing import Optional, Sequence

try:
    from typing import ForwardRef  # type: ignore
except ImportError:
    from typing import _ForwardRef as ForwardRef  # type: ignore

# from .. import attr
import attr
import cattr
import pytest  # type: ignore

from looker_sdk.rtl import model as ml
from looker_sdk.rtl import serialize as sr


class Enum1(enum.Enum):
    """Predifined enum, used as ForwardRef.
    """

    entry1 = "entry1"
    invalid_api_enum_value = "invalid_api_enum_value"


Enum1.__new__ = ml.safe_enum__new__


@attr.s(auto_attribs=True, init=False)
class ModelNoRefs1(ml.Model):
    """Predifined model, used as ForwardRef.

    Since this model has no properties that are forwardrefs to other
    objects we can just decorate the class rather than doing the
    __annotations__ hack.
    """

    name1: str

    def __init__(self, *, name1: str):
        self.name1 = name1


@attr.s(auto_attribs=True, init=False)
class Model(ml.Model):
    """Representative model.

    [De]Serialization of API models relies on the attrs and cattrs
    libraries with some additional customization. This model represents
    these custom treatments and provides documentation for how and why
    they are needed.
    """

    # enum1 and model_no_refs1 are both defined before this class
    # yet we will still refer to them using forward reference (double quotes)
    # because we do not keep track of definition order in the generated code
    enum1: "Enum1"
    model_no_refs1: "ModelNoRefs1"

    # enum2 and model_no_refs2 are both defined after this class and so the
    # forward reference annotation is required.
    enum2: "Enum2"
    model_no_refs2: "ModelNoRefs2"

    # Optional[] and List[]
    list_enum1: Sequence["Enum1"]
    list_model_no_refs1: Sequence["ModelNoRefs1"]
    opt_enum1: Optional["Enum1"] = None
    opt_model_no_refs1: Optional["ModelNoRefs1"] = None

    # standard types
    id: Optional[int] = None
    name: Optional[str] = None

    # testing reserved keyword translations
    class_: Optional[str] = None
    finally_: Optional[Sequence[int]] = None

    # Because this model has "bare" forward ref annotated properties
    # (enum1, enum2, model_no_refs1, and model_no_refs2) we need to tell
    # the attr library that they're actually ForwardRef objects so that
    # cattr will match our forward_ref_structure_hook structure hook
    #
    #
    # Note: just doing the following:
    #
    # `converter.register_structure_hook("Enum1", structure_hook)`
    #
    # does not work. cattr stores these hooks using functools singledispatch
    # which in turn creates a weakref.WeakKeyDictionary for the dispatch_cache.
    # While the registration happens, the cache lookup throws a TypeError
    # instead of a KeyError so we never look in the registry.
    __annotations__ = {
        # python generates these entries as "enum1": "Enum1" etc, we need
        # them to be of the form "enum1": ForwardRef("Enum1")
        "enum1": ForwardRef("Enum1"),
        "model_no_refs1": ForwardRef("ModelNoRefs1"),
        "enum2": ForwardRef("Enum2"),
        "model_no_refs2": ForwardRef("ModelNoRefs2"),
        # python "correctly" inserts the remaining entries but we have to
        # define all or nothing using this API
        "list_enum1": Sequence["Enum1"],
        "list_model_no_refs1": Sequence["ModelNoRefs1"],
        "opt_enum1": Optional["Enum1"],
        "opt_model_no_refs1": Optional["ModelNoRefs1"],
        "id": Optional[int],
        "name": Optional[str],
        "class_": Optional[str],
        "finally_": Optional[Sequence[int]],
    }

    def __init__(
        self,
        *,
        enum1: "Enum1",
        model_no_refs1: "ModelNoRefs1",
        enum2: "Enum2",
        model_no_refs2: "ModelNoRefs2",
        list_enum1: Sequence["Enum1"],
        list_model_no_refs1: Sequence["ModelNoRefs1"],
        opt_enum1: Optional["Enum1"] = None,
        opt_model_no_refs1: Optional["ModelNoRefs1"] = None,
        id: Optional[int] = None,
        name: Optional[str] = None,
        class_: Optional[str] = None,
        finally_: Optional[Sequence[int]] = None,
    ):
        """Keep mypy and IDE suggestions happy.

        We cannot use the built in __init__ generation attrs offers
        because mypy complains about unknown keyword argument, even
        when kw_only=True is set below. Furthermore, IDEs do not pickup
        on the attrs generated __init__ so completion suggestion fails
        for insantiating these classes otherwise.
        """
        self.enum1 = enum1
        self.model_no_refs1 = model_no_refs1
        self.enum2 = enum2
        self.model_no_refs2 = model_no_refs2
        self.list_enum1 = list_enum1
        self.list_model_no_refs1 = list_model_no_refs1
        self.opt_enum1 = opt_enum1
        self.opt_model_no_refs1 = opt_model_no_refs1
        self.id = id
        self.name = name
        self.class_ = class_
        self.finally_ = finally_


class Enum2(enum.Enum):
    """Post defined enum, used as ForwardRef.
    """

    entry2 = "entry2"
    invalid_api_enum_value = "invalid_api_enum_value"


Enum2.__new__ = ml.safe_enum__new__


@attr.s(auto_attribs=True, init=False)
class ModelNoRefs2(ml.Model):
    """Post defined model, used as ForwardRef.

    Since this model has no properties that are forwardrefs to other
    objects we can just decorate the class rather than doing the
    __annotations__ hack.
    """

    name2: str

    def __init__(self, *, name2: str):
        self.name2 = name2


converter = cattr.Converter()
structure_hook = functools.partial(sr.forward_ref_structure_hook, globals(), converter)
translate_keys_structure_hook = functools.partial(
    sr.translate_keys_structure_hook, converter
)
converter.register_structure_hook(ForwardRef("Model"), structure_hook)
converter.register_structure_hook(ForwardRef("ChildModel"), structure_hook)
converter.register_structure_hook(ForwardRef("Enum1"), structure_hook)
converter.register_structure_hook(ForwardRef("Enum2"), structure_hook)
converter.register_structure_hook(ForwardRef("ModelNoRefs1"), structure_hook)
converter.register_structure_hook(ForwardRef("ModelNoRefs2"), structure_hook)
converter.register_structure_hook(Model, translate_keys_structure_hook)


MODEL_DATA = {
    "enum1": "entry1",
    "model_no_refs1": {"name1": "model_no_refs1_name"},
    "enum2": "entry2",
    "model_no_refs2": {"name2": "model_no_refs2_name"},
    "list_enum1": ["entry1"],
    "list_model_no_refs1": [{"name1": "model_no_refs1_name"}],
    "opt_enum1": "entry1",
    "opt_model_no_refs1": {"name1": "model_no_refs1_name"},
    "id": 1,
    "name": "my-name",
    "class": "model-name",
    "finally": [1, 2, 3],
}


def test_deserialize_single():
    """Deserialize functionality

    Should handle python reserved keywords as well as attempting to
    convert field values to proper type.
    """
    # check that type conversion happens, str -> int in this case
    data = copy.deepcopy(MODEL_DATA)
    data["id"] = "1"

    d = json.dumps(data)
    model = sr.deserialize(data=d, structure=Model, converter=converter)
    assert model == Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[1, 2, 3],
    )


def test_deserialize_list():
    # check that type conversion happens
    data = [MODEL_DATA]

    models = sr.deserialize(
        data=json.dumps(data), structure=Sequence[Model], converter=converter
    )
    assert models == [
        Model(
            enum1=Enum1.entry1,
            model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
            enum2=Enum2.entry2,
            model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
            list_enum1=[Enum1.entry1],
            list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
            opt_enum1=Enum1.entry1,
            opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
            id=1,
            name="my-name",
            class_="model-name",
            finally_=[1, 2, 3],
        ),
    ]


def test_deserialize_partial():
    data = copy.deepcopy(MODEL_DATA)
    del data["id"]
    del data["opt_enum1"]
    del data["opt_model_no_refs1"]

    model = sr.deserialize(data=json.dumps(data), structure=Model, converter=converter)
    assert model == Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=None,
        opt_model_no_refs1=None,
        id=None,
        name="my-name",
        class_="model-name",
        finally_=[1, 2, 3],
    )


def test_deserialize_with_null():
    data = copy.deepcopy(MODEL_DATA)

    # json.dumps sets None to null
    data["id"] = None
    data["opt_enum1"] = None
    data["opt_model_no_refs1"] = None

    model = sr.deserialize(data=json.dumps(data), structure=Model, converter=converter)
    assert model == Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=None,
        opt_model_no_refs1=None,
        id=None,
        name="my-name",
        class_="model-name",
        finally_=[1, 2, 3],
    )


@pytest.mark.parametrize(
    "data, structure",
    [
        # ??
        # Error: mypy: Variable "tests.rtl.test_serialize.Model" is not valid as a type
        (MODEL_DATA, Sequence[Model]),  # type: ignore
        ([MODEL_DATA], Model),
    ],
)
def test_deserialize_data_structure_mismatch(data, structure):
    data = json.dumps(data)
    with pytest.raises(sr.DeserializeError):
        sr.deserialize(data=data, structure=structure, converter=converter)


def test_serialize_single():
    model = Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[1, 2, 3],
    )
    expected = json.dumps(MODEL_DATA).encode("utf-8")
    assert sr.serialize(model) == expected


def test_serialize_sequence():
    model = Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[1, 2, 3],
    )
    expected = json.dumps([MODEL_DATA, MODEL_DATA]).encode("utf-8")
    assert sr.serialize([model, model]) == expected


def test_serialize_partial():
    """Do not send json null for model None field values.
    """
    model = Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
    )
    expected = json.dumps(
        {
            "enum1": "entry1",
            "model_no_refs1": {"name1": "model_no_refs1_name"},
            "enum2": "entry2",
            "model_no_refs2": {"name2": "model_no_refs2_name"},
            "list_enum1": ["entry1"],
            "list_model_no_refs1": [{"name1": "model_no_refs1_name"}],
        }
    ).encode("utf-8")
    assert sr.serialize(model) == expected


def test_serialize_explict_null():
    """Send json null for model field EXPLICIT_NULL values.
    """
    # pass EXPLICIT_NULL into constructor
    model = Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        name=ml.EXPLICIT_NULL,
        class_=ml.EXPLICIT_NULL,
    )
    # set property to EXPLICIT_NULL
    model.finally_ = ml.EXPLICIT_NULL

    expected = json.dumps(
        {
            "enum1": "entry1",
            "model_no_refs1": {"name1": "model_no_refs1_name"},
            "enum2": "entry2",
            "model_no_refs2": {"name2": "model_no_refs2_name"},
            "list_enum1": ["entry1"],
            "list_model_no_refs1": [{"name1": "model_no_refs1_name"}],
            # json.dumps puts these into the json as null
            "name": None,
            "class": None,
            "finally": None,
        }
    ).encode("utf-8")
    assert sr.serialize(model) == expected


def test_safe_enum_deserialization():
    data = copy.deepcopy(MODEL_DATA)
    data["enum1"] = "not an Enum1 member!"
    data["enum2"] = ""
    model = Model(
        enum1=Enum1.invalid_api_enum_value,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.invalid_api_enum_value,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[1, 2, 3],
    )
    assert (
        sr.deserialize(data=json.dumps(data), structure=Model, converter=converter)
        == model
    )
