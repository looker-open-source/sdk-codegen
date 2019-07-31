import copy
import json
from typing import List

import attr
import cattr
import pytest  # type: ignore

from looker.rtl import model as ml
from looker.rtl import serialize as sr


@attr.s(auto_attribs=True)
class ChildModel(ml.Model):
    id: int
    import_: str


@attr.s(auto_attribs=True)
class Model(ml.Model):
    class_: str
    finally_: List[ChildModel]


cattr.register_structure_hook(Model, sr.keyword_field_structure_hook)
cattr.register_unstructure_hook(Model, sr.keyword_field_unstructure_hook)
cattr.register_structure_hook(ChildModel, sr.keyword_field_structure_hook)
cattr.register_unstructure_hook(ChildModel, sr.keyword_field_unstructure_hook)

MODEL_DATA = {
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
    assert isinstance(model.finally_, list)
    assert len(model.finally_) == 2
    for child in model.finally_:
        assert isinstance(child, ChildModel)
        assert isinstance(child.id, int)


def test_deserialize_list():
    # check that type conversion happens
    data = [MODEL_DATA, MODEL_DATA]

    models = sr.deserialize(json.dumps(data), List[Model])
    assert isinstance(models, list)
    assert len(models) == 2
    for model in models:
        assert isinstance(model.finally_, list)
        assert len(model.finally_) == 2
        for child in model.finally_:
            assert isinstance(child, ChildModel)
            assert isinstance(child.id, int)


@pytest.mark.parametrize(
    "data, structure", [(MODEL_DATA, List[Model]), ([MODEL_DATA], Model)]
)
def test_deserialize_data_structure_mismatch(data, structure):
    data = json.dumps(data)
    with pytest.raises(sr.DeserializeError):
        sr.deserialize(data, structure)


def test_serialize_single():
    model = Model(
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
        class_="model-name",
        finally_=[
            ChildModel(id=1, import_="child1"),
            ChildModel(id=2, import_="child2"),
        ],
    )
    expected = json.dumps([MODEL_DATA]).encode("utf-8")
    assert sr.serialize([model]) == expected
