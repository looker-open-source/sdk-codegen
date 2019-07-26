"""Test the requests transport.
"""
import dataclasses as dc
import json
from typing import List

import pytest
import undictify as ud

from looker.rtl import serialize as sr

# pylint: disable=too-few-public-methods
# pylint: disable=missing-docstring


@ud.type_checked_constructor(convert=True)
@dc.dataclass
class ChildModel(sr.SDKModel):
    name: str
    id: int


@ud.type_checked_constructor(convert=True)
@dc.dataclass
class Model(sr.SDKModel):
    name: str
    children: List[ChildModel]


def test_deserialize():
    data = json.dumps({
        'name':
        'model-name',
        'children': [
            {
                'id': 1,
                'name': 'child1'
            },
            {
                # check "convert" param on type_checked_constructor
                'id': "2",
                'name': 'child2'
            }
        ]
    })

    model = sr.deserialize(data, Model)
    assert isinstance(model, Model)
    assert isinstance(model.children, list)
    assert len(model.children) == 2
    for child in model.children:
        assert isinstance(child, ChildModel)
        assert isinstance(child.id, int)


def test_deserialize_expected_list():
    data = json.dumps({
        'name': 'model-name',
        'children': [{
            'name': 'child1'
        }, {
            'name': 'child2'
        }]
    })
    with pytest.raises(sr.DeserializeError) as excinfo:
        sr.deserialize(data, Model, many=True)
    excinfo.match('^Require list data$')


def test_deserialize_expected_dict():
    data = json.dumps([{
        'name': 'model-name',
        'children': [{
            'name': 'child1'
        }, {
            'name': 'child2'
        }]
    }])
    with pytest.raises(sr.DeserializeError) as excinfo:
        sr.deserialize(data, Model, many=False)
    excinfo.match('^Require dict data$')
