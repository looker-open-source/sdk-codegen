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
import datetime
import enum
import functools
import json

from typing import Optional, Sequence

try:
    from typing import ForwardRef  # type: ignore
except ImportError:
    from typing import _ForwardRef as ForwardRef  # type: ignore

import attr
import cattr
import pytest  # type: ignore

from looker_sdk.rtl import hooks
from looker_sdk.rtl import model as ml
from looker_sdk.rtl import serialize as sr


class Enum1(enum.Enum):
    """Predifined enum, used as ForwardRef."""

    entry1 = "entry1"
    entry2 = "entry2"
    invalid_api_enum_value = "invalid_api_enum_value"


# ignore mypy: "Cannot assign to a method"
Enum1.__new__ = ml.safe_enum__new__  # type: ignore


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
    list_opt_model_no_refs1: Optional[Sequence["ModelNoRefs1"]] = None

    # standard types
    id: Optional[int] = None
    name: Optional[str] = None
    datetime_field: Optional[datetime.datetime] = None

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
        "list_opt_model_no_refs1": Optional[Sequence["ModelNoRefs1"]],
        "id": Optional[int],
        "name": Optional[str],
        "datetime_field": Optional[datetime.datetime],
        "class_": Optional[str],
        "finally_": Optional[Sequence[int]],
    }

    # store context so that base class can eval "Enum1" instance from
    # ForwardRef("Enum1") annotation for __setitem__
    __global_context = globals()

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
        list_opt_model_no_refs1: Optional[Sequence["ModelNoRefs1"]] = None,
        id: Optional[int] = None,
        name: Optional[str] = None,
        datetime_field: Optional[datetime.datetime] = None,
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
        self.list_opt_model_no_refs1 = list_opt_model_no_refs1
        self.id = id
        self.name = name
        self.datetime_field = datetime_field
        self.class_ = class_
        self.finally_ = finally_


class Enum2(enum.Enum):
    """Post defined enum, used as ForwardRef."""

    entry2 = "entry2"
    invalid_api_enum_value = "invalid_api_enum_value"


# ignore mypy: "Cannot assign to a method"
Enum2.__new__ = ml.safe_enum__new__  # type: ignore


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
translate_keys_structure_hook = functools.partial(
    sr.translate_keys_structure_hook, converter
)
converter.register_structure_hook(Model, translate_keys_structure_hook)
converter.register_structure_hook(datetime.datetime, hooks.datetime_structure_hook)
converter.register_unstructure_hook(datetime.datetime, hooks.datetime_unstructure_hook)
unstructure_hook = functools.partial(hooks.unstructure_hook, converter)
converter.register_unstructure_hook(Model, unstructure_hook)

# only required for 3.6 for unittest but for some reason integration tests need it
# for all python versions
forward_ref_structure_hook = functools.partial(
    sr.forward_ref_structure_hook, globals(), converter
)
converter.register_structure_hook_func(
    lambda t: t.__class__ is ForwardRef, forward_ref_structure_hook
)


DATETIME_VALUE = datetime.datetime.fromtimestamp(1625246159, datetime.timezone.utc)
DATETIME_VALUE_STR = DATETIME_VALUE.strftime("%Y-%m-%dT%H:%M:%S.%f%z")
MODEL_DATA = {
    "enum1": "entry1",
    "model_no_refs1": {"name1": "model_no_refs1_name"},
    "enum2": "entry2",
    "model_no_refs2": {"name2": "model_no_refs2_name"},
    "list_enum1": ["entry1"],
    "list_model_no_refs1": [{"name1": "model_no_refs1_name"}],
    "opt_enum1": "entry1",
    "opt_model_no_refs1": {"name1": "model_no_refs1_name"},
    "list_opt_model_no_refs1": [{"name1": "model_no_refs1_name"}],
    "id": 1,
    "name": "my-name",
    "datetime_field": DATETIME_VALUE_STR,
    "class": "model-name",
    "finally": [1, 2, 3],
}


@pytest.fixture
def bm():
    return Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=None,
        id=1,
        name="my-name",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=[1, 2, 3],
    )


def test_dict_getitem_simple(bm):
    assert bm["id"] == bm.id
    assert bm["name"] == bm.name
    assert bm["class"] == bm.class_
    assert bm["finally"] == bm.finally_
    with pytest.raises(KeyError):
        bm["class_"]
    with pytest.raises(KeyError):
        bm["finally_"]


def test_dict_getitem_child(bm):
    assert bm["model_no_refs1"] == ModelNoRefs1(name1="model_no_refs1_name")
    assert bm["model_no_refs1"] is bm.model_no_refs1
    assert bm["model_no_refs1"]["name1"] == "model_no_refs1_name"
    assert bm["list_model_no_refs1"][0] == ModelNoRefs1(name1="model_no_refs1_name")
    assert bm["list_model_no_refs1"][0] is bm.list_model_no_refs1[0]
    assert bm["list_model_no_refs1"][0]["name1"] == "model_no_refs1_name"
    # Model defines this property and `bm.opt_model_no_refs1 is None` so key
    # access here should do the same (https://git.io/JRrKm)
    assert bm["opt_model_no_refs1"] is None
    with pytest.raises(KeyError):
        bm["no_such_prop"]


def test_dict_getitem_enum(bm):
    assert bm["enum1"] == "entry1"


def test_dict_setitem_simple(bm):
    bm["id"] = 2
    assert bm["id"] == 2
    assert bm.id == 2
    bm["name"] = "some-name"
    assert bm["name"] == "some-name"
    assert bm.name == "some-name"
    bm["class"] = "some-class"
    assert bm["class"] == "some-class"
    assert bm.class_ == "some-class"
    bm["finally"] = [4, 5, 6]
    assert bm["finally"] == [4, 5, 6]
    assert bm["finally"] is bm.finally_
    with pytest.raises(AttributeError) as exc:
        bm["foobar"] = 5
    assert str(exc.value) == "'Model' object has no attribute 'foobar'"


def test_dict_setitem_child(bm):
    bm["model_no_refs1"]["name1"] = "model_no_refs1_another_name"
    assert bm["model_no_refs1"]["name1"] == "model_no_refs1_another_name"

    # creating new children from dictionaries instantiates a new child model
    # object from that dict but does not maintain a reference.
    child_dict = {"name1": "I used a dictionary"}
    bm["model_no_refs1"] = child_dict
    assert bm["model_no_refs1"] == ModelNoRefs1(name1="I used a dictionary")
    assert bm.model_no_refs1 is not child_dict
    bm["model_no_refs1"]["name1"] = "I'm not a reference to child_dict"
    assert child_dict["name1"] != "I'm not a reference to child_dict"
    assert child_dict["name1"] == "I used a dictionary"


def test_dict_setitem_enum(bm):
    bm["enum1"] = "entry2"
    assert bm["enum1"] == "entry2"
    # it's really still an Enum1 member under the hood
    assert bm.enum1 == Enum1.entry2
    with pytest.raises(ValueError) as exc:
        bm["enum1"] = "foobar"
    assert str(exc.value) == (
        "Invalid value 'foobar' for 'Model.enum1'. Valid values are ['entry1', 'entry2']"
    )
    with pytest.raises(ValueError) as exc:
        bm["enum1"] = Enum1.entry1  # can't use a real Enum with dict
    assert str(exc.value) == (
        "Invalid value 'Enum1.entry1' for 'Model.enum1'. Valid values are "
        "['entry1', 'entry2']"
    )


def test_dict_delitem(bm):
    del bm["id"]
    assert bm.id is None
    # Model defines this property and `bm.id is None` so key
    # access here should do the same (https://git.io/JRrKm)
    assert bm["id"] is None
    del bm["class"]
    assert bm.class_ is None
    # Model defines this property and `bm.class_ is None` so key
    # access here should do the same (https://git.io/JRrKm)
    assert bm["class"] is None
    with pytest.raises(KeyError):
        del bm["no-such-key"]


def test_dict_iter(bm):
    keys = [
        "enum1",
        "model_no_refs1",
        "enum2",
        "model_no_refs2",
        "list_enum1",
        "list_model_no_refs1",
        "opt_enum1",
        "id",
        "name",
        "datetime_field",
        "class",
        "finally",
    ]
    for k in bm:
        keys.remove(k)
    assert keys == []


def test_dict_contains(bm):
    assert "id" in bm
    assert "foobar" not in bm
    assert "finally_" not in bm
    assert "finally" in bm


def test_dict_keys(bm):
    assert list(bm.keys()) == [
        "enum1",
        "model_no_refs1",
        "enum2",
        "model_no_refs2",
        "list_enum1",
        "list_model_no_refs1",
        "opt_enum1",
        "id",
        "name",
        "datetime_field",
        "class",
        "finally",
    ]


def test_dict_items(bm):
    assert list(bm.items()) == [
        ("enum1", "entry1"),
        ("model_no_refs1", {"name1": "model_no_refs1_name"}),
        ("enum2", "entry2"),
        ("model_no_refs2", {"name2": "model_no_refs2_name"}),
        ("list_enum1", ["entry1"]),
        ("list_model_no_refs1", [{"name1": "model_no_refs1_name"}]),
        ("opt_enum1", "entry1"),
        ("id", 1),
        ("name", "my-name"),
        ("datetime_field", DATETIME_VALUE_STR),
        ("class", "model-name"),
        ("finally", [1, 2, 3]),
    ]


def test_dict_values(bm):
    assert list(bm.values()) == [
        "entry1",
        {"name1": "model_no_refs1_name"},
        "entry2",
        {"name2": "model_no_refs2_name"},
        ["entry1"],
        [{"name1": "model_no_refs1_name"}],
        "entry1",
        1,
        "my-name",
        DATETIME_VALUE_STR,
        "model-name",
        [1, 2, 3],
    ]


def test_dict_get(bm):
    assert bm.get("id") == bm.id
    assert bm.get("id", 5000) == bm.id
    assert bm.get("not-a-key") is None
    assert bm.get("not-a-key", "default-value") == "default-value"
    assert bm.get("model_no_refs1") is bm["model_no_refs1"]
    assert bm["model_no_refs1"].get("name1") == "model_no_refs1_name"
    assert bm["model_no_refs1"].get("name1", "default-name") == "model_no_refs1_name"
    assert bm["model_no_refs1"].get("name2") is None
    assert bm["model_no_refs1"].get("name2", "default-name") == "default-name"


def test_dict_pop(bm):
    assert bm.pop("id") == 1
    assert bm.id is None
    # Model defines this property and `bm.id is None` so key
    # access here should do the same (https://git.io/JRrKm)
    assert bm["id"] is None

    assert bm.pop("name", "default-name") == "my-name"
    assert bm.name is None
    # Model defines this property and `bm.name is None` so key
    # access here should do the same (https://git.io/JRrKm)
    assert bm["name"] is None

    assert bm.pop("no-name", "default-name") == "default-name"

    assert bm.pop("class") == "model-name"
    assert bm.class_ is None
    # Model defines this property and `bm.name is None` so key
    # access here should do the same (https://git.io/JRrKm)
    assert bm["class"] is None


def test_dict_popitem(bm):
    with pytest.raises(NotImplementedError):
        bm.popitem()


def test_dict_clear(bm):
    with pytest.raises(NotImplementedError):
        bm.popitem()


def test_dict_update(bm):
    bm.update(
        {
            "id": 2,
            "name": "new-name",
            "class": "new-class",
            "model_no_refs1": {"name1": "new-name1"},
        }
    )
    assert bm["id"] == 2
    assert bm["name"] == "new-name"
    assert bm["class"] == "new-class"
    assert bm["model_no_refs1"]["name1"] == "new-name1"


def test_dict_setdefault(bm):
    bm.setdefault("id", 2)
    assert bm["id"] == 1
    del bm["id"]
    bm.setdefault("id", 2)
    assert bm["id"] == 2

    with pytest.raises(AttributeError):
        bm.setdefault("foobar", 5)


def test_dict_copy(bm):
    with pytest.raises(NotImplementedError):
        bm.copy()


def test_deserialize_single() -> None:
    """Deserialize functionality

    Should handle python reserved keywords as well as attempting to
    convert field values to proper type.
    """
    # check that type conversion happens, str -> int and int -> str in this case
    data = copy.deepcopy(MODEL_DATA)
    data["id"] = "1"
    data["name"] = 25

    d = json.dumps(data)
    model = sr.deserialize(data=d, structure=Model, converter=converter)
    assert model == Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=(Enum1.entry1,),
        list_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        list_opt_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        id=1,
        name="25",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=(1, 2, 3),
    )


def test_deserialize_list():
    # check that type conversion happens
    data = [MODEL_DATA]

    models = sr.deserialize(
        data=json.dumps(data), structure=Sequence[Model], converter=converter
    )
    assert models == (
        Model(
            enum1=Enum1.entry1,
            model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
            enum2=Enum2.entry2,
            model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
            list_enum1=(Enum1.entry1,),
            list_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
            opt_enum1=Enum1.entry1,
            opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
            list_opt_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
            id=1,
            name="my-name",
            datetime_field=DATETIME_VALUE,
            class_="model-name",
            finally_=(1, 2, 3),
        ),
    )


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
        list_enum1=(Enum1.entry1,),
        list_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        opt_enum1=None,
        opt_model_no_refs1=None,
        list_opt_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        id=None,
        name="my-name",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=(1, 2, 3),
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
        list_enum1=(Enum1.entry1,),
        list_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        opt_enum1=None,
        opt_model_no_refs1=None,
        list_opt_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        id=None,
        name="my-name",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=(1, 2, 3),
    )


@pytest.mark.skip(reason="TODO: This breaks CI right now")
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
        list_opt_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        id=1,
        name="my-name",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=[1, 2, 3],
    )
    expected = json.dumps(MODEL_DATA).encode("utf-8")
    assert sr.serialize(api_model=model, converter=converter) == expected


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
        list_opt_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        id=1,
        name="my-name",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=[1, 2, 3],
    )
    expected = json.dumps([MODEL_DATA, MODEL_DATA]).encode("utf-8")
    assert sr.serialize(api_model=[model, model], converter=converter) == expected


def test_serialize_partial():
    """Do not send json null for model None field values."""
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
    assert sr.serialize(api_model=model, converter=converter) == expected

@pytest.mark.skip(reason="TODO: This breaks CI right now")
def test_serialize_explict_null():
    """Send json null for model field EXPLICIT_NULL values."""
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
    assert sr.serialize(api_model=model, converter=converter) == expected


def test_safe_enum_deserialization():
    data = copy.deepcopy(MODEL_DATA)
    data["enum1"] = "not an Enum1 member!"
    data["enum2"] = ""
    model = Model(
        enum1=Enum1.invalid_api_enum_value,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.invalid_api_enum_value,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=(Enum1.entry1,),
        list_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        list_opt_model_no_refs1=(ModelNoRefs1(name1="model_no_refs1_name"),),
        id=1,
        name="my-name",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=(1, 2, 3),
    )
    assert (
        sr.deserialize(data=json.dumps(data), structure=Model, converter=converter)
        == model
    )
