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
    id: int
    name: str


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


def test_serialize():
    model = Model(name='model-name',
                  children=[
                      ChildModel(id=1, name='child1'),
                      ChildModel(id=2, name='child2'),
                  ])
    # yapf: disable
    # pylint: disable=bad-continuation
    expected = (
        '{'
            '"name": '
            '"model-name", '
            '"children": ['
                '{'
                    '"id": 1, '
                    '"name": "child1"'
                '}, '
                '{'
                    '"id": 2, '
                    '"name": "child2"'
                '}'
            ']'
        '}'
    )
    # yapf: enable
    assert sr.serialize(model) == expected
