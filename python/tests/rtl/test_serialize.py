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


@attr.s(auto_attribs=True, kw_only=True, init=False)
class WriteModel(ml.Model):
    id: int
    name: Optional[str] = None
    class_: Optional[str] = None
    finally_: Optional[Sequence["ChildModel"]] = None

    def __init__(
        self,
        *,
        id: int,
        name: Optional[str] = None,
        class_: Optional[str] = None,
        finally_: Optional[Sequence["ChildModel"]] = None
    ):
        self.id = id
        self.name = name
        self.class_ = class_
        self.finally_ = finally_


@attr.s(auto_attribs=True, kw_only=True, init=False)
class WriteChildModel(ml.Model):
    id: int
    import_: Optional[str] = None

    def __init__(self, *, id: int, import_: Optional[str] = None):
        self.id = id
        self.import_ = import_


converter = cattr.Converter()
structure_hook = functools.partial(sr.structure_hook, globals(), converter)
converter.register_structure_hook(ForwardRef("Model"), structure_hook)
converter.register_structure_hook(ForwardRef("ChildModel"), structure_hook)
converter.register_structure_hook(ForwardRef("WriteModel"), structure_hook)
converter.register_structure_hook(ForwardRef("WriteChildModel"), structure_hook)
converter.register_structure_hook(Model, structure_hook)

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

    model = sr.deserialize(data=json.dumps(data), structure=Model, converter=converter)
    assert isinstance(model, Model)
    assert isinstance(model.id, int)
    assert model.id == 1
    assert isinstance(model.name, str)
    assert model.name == "my-name"
    assert isinstance(model.class_, str)
    assert model.class_ == "model-name"
    assert isinstance(model.finally_, list)
    assert len(model.finally_) == 2
    for child in model.finally_:
        assert isinstance(child, ChildModel)
        assert isinstance(child.id, int)


def test_deserialize_list():
    # check that type conversion happens
    data = [MODEL_DATA, MODEL_DATA]

    models = sr.deserialize(
        data=json.dumps(data), structure=Sequence[Model], converter=converter
    )
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

    model = sr.deserialize(data=json.dumps(data), structure=Model, converter=converter)
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

    model = sr.deserialize(data=json.dumps(data), structure=Model, converter=converter)
    assert isinstance(model, Model)
    assert model.id is None
    assert isinstance(model.name, str)
    assert model.name == "my-name"
    assert isinstance(model.finally_, list)
    assert len(model.finally_) == 2
    assert model.finally_[0].id is None
    assert model.finally_[1].id == 2


@pytest.mark.parametrize(
    "data, structure", [(MODEL_DATA, Sequence[Model]), ([MODEL_DATA], Model)]
)
def test_deserialize_data_structure_mismatch(data, structure):
    data = json.dumps(data)
    with pytest.raises(sr.DeserializeError):
        sr.deserialize(data=data, structure=structure, converter=converter)


def test_serialize_single():
    model = WriteModel(
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[
            WriteChildModel(id=1, import_="child1"),
            WriteChildModel(id=2, import_="child2"),
        ],
    )
    expected = json.dumps(MODEL_DATA).encode("utf-8")
    assert sr.serialize(model) == expected


def test_serialize_sequence():
    model = WriteModel(
        id=1,
        name="my-name",
        class_="model-name",
        finally_=[
            WriteChildModel(id=1, import_="child1"),
            WriteChildModel(id=2, import_="child2"),
        ],
    )
    expected = json.dumps([MODEL_DATA, MODEL_DATA]).encode("utf-8")
    assert sr.serialize([model, model]) == expected


def test_serialize_partial():
    """Do not send json null for model None field values.
    """
    model = WriteModel(id=1, finally_=[WriteChildModel(id=1)])
    expected = json.dumps({"id": 1, "finally": [{"id": 1}]}).encode("utf-8")
    assert sr.serialize(model) == expected


def test_serialize_explict_null():
    """Send json null for model field EXPLICIT_NULL values.
    """
    model = WriteModel(
        id=1,
        name=ml.EXPLICIT_NULL,
        class_=ml.EXPLICIT_NULL,
        finally_=[
            WriteChildModel(id=1, import_="child1"),
            WriteChildModel(id=2, import_="child2"),
        ],
    )
    model.finally_[0].import_ = ml.EXPLICIT_NULL

    data = copy.deepcopy(MODEL_DATA)
    # json.dumps sets these to null
    data["name"] = None
    data["class"] = None
    data["finally"][0]["import"] = None
    expected = json.dumps(data).encode("utf-8")
    assert sr.serialize(model) == expected
