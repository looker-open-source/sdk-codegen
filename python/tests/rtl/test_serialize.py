import copy
import functools
import json

# ignoring "Module 'typing' has no attribute 'ForwardRef'"
from typing import ForwardRef, Optional, Sequence  # type: ignore

import attr
import cattr
import pytest  # type: ignore

from looker_sdk.rtl import model as ml
from looker_sdk.rtl import serialize as sr


@attr.s(auto_attribs=True, kw_only=True)
class Model(ml.Model):
    id: Optional[int] = None
    name: Optional[str] = None
    class_: Optional[str] = None
    finally_: Optional[Sequence["ChildModel"]] = None


@attr.s(auto_attribs=True, kw_only=True)
class ChildModel(ml.Model):
    id: Optional[int] = None
    import_: Optional[str] = None


structure_hook = functools.partial(sr.structure_hook, globals())  # type: ignore
cattr.register_structure_hook(
    ForwardRef("ChildModel"), structure_hook  # type: ignore
)

MODEL_DATA = {
    "id": 1,
    "name": "my-name",
    "class": "model-name",
    "finally": [{"id": 1, "import": "child1"}, {"id": 2, "import": "child2"}],
}


def test_deserialize_single():
    """Deserialize functionality

    Should handle python reserved keywords as well as attempting to
    convert field values to proper type.
    """
    # check that type conversion happens
    data = copy.deepcopy(MODEL_DATA)
    data["finally"][0]["id"] = "1"

    model = sr.deserialize(json.dumps(data), Model)
    assert isinstance(model, Model)
    assert isinstance(model.id, int)
    assert model.id == 1
    assert isinstance(model.name, str)
    assert model.name == "my-name"
    assert isinstance(model.finally_, list)
    assert len(model.finally_) == 2
    for child in model.finally_:
        assert isinstance(child, ChildModel)
        assert isinstance(child.id, int)


def test_deserialize_list():
    # check that type conversion happens
    data = [MODEL_DATA, MODEL_DATA]

    models = sr.deserialize(json.dumps(data), Sequence[Model])
    assert isinstance(models, list)
    assert len(models) == 2
    for model in models:
        assert isinstance(model.finally_, list)
        assert len(model.finally_) == 2
        for child in model.finally_:
            assert isinstance(child, ChildModel)
            assert isinstance(child.id, int)


def test_deserialize_partial():
    data = copy.deepcopy(MODEL_DATA)
    del data["id"]
    del data["finally"][0]["id"]

    model = sr.deserialize(json.dumps(data), Model)
    assert isinstance(model, Model)
    assert model.id is None
    assert isinstance(model.name, str)
    assert model.name == "my-name"
    assert isinstance(model.finally_, list)
    assert len(model.finally_) == 2
    assert model.finally_[0].id is None
    assert model.finally_[1].id == 2


def test_deserialize_with_null():
    data = copy.deepcopy(MODEL_DATA)

    # json.dumps sets these to null
    data["id"] = None
    data["finally"][0]["id"] = None

    model = sr.deserialize(json.dumps(data), Model)
    assert isinstance(model, Model)
    assert model.id is None
    assert isinstance(model.name, str)
    assert model.name == "my-name"
    assert isinstance(model.finally_, list)
    assert len(model.finally_) == 2
    assert model.finally_[0].id is None
    assert model.finally_[1].id == 2


@pytest.mark.parametrize(  # type: ignore
    "data, structure", [(MODEL_DATA, Sequence[Model]), ([MODEL_DATA], Model)]
)
def test_deserialize_data_structure_mismatch(data, structure):
    data = json.dumps(data)
    with pytest.raises(sr.DeserializeError):
        sr.deserialize(data, structure)


def test_serialize_single():
    model = Model(
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[
            ChildModel(id=1, import_="child1"),
            ChildModel(id=2, import_="child2"),
        ],
    )
    expected = json.dumps(MODEL_DATA).encode("utf-8")
    assert sr.serialize(model) == expected


def test_serialize_sequence():
    model = Model(
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[
            ChildModel(id=1, import_="child1"),
            ChildModel(id=2, import_="child2"),
        ],
    )
    expected = json.dumps([MODEL_DATA, MODEL_DATA]).encode("utf-8")
    assert sr.serialize([model, model]) == expected


def test_serialize_partial():
    model = Model(class_="model-name", finally_=[ChildModel(id=1)])
    expected = json.dumps({"class": "model-name", "finally": [{"id": 1}]}).encode(
        "utf-8"
    )
    assert sr.serialize(model) == expected


def test_serialize_explict_null():
    model = Model(
        id=1,
        name=ml.EXPLICIT_NULL,  # testing in constructor
        finally_=[
            ChildModel(id=1, import_="child1"),
            ChildModel(id=2, import_="child2"),
        ],
    )
    model.class_ = None  # testing on instance
    model.finally_[0].id = ml.EXPLICIT_NULL  # testing EXPLICIT_NULL on instance

    data = copy.deepcopy(MODEL_DATA)
    # json.dumps sets these to null
    data["name"] = None
    data["class"] = None
    data["finally"][0]["id"] = None
    expected = json.dumps(data).encode("utf-8")
    assert sr.serialize(model) == expected
