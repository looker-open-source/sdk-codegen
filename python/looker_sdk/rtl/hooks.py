# The MIT License (MIT)
#
# Copyright (c) 2022 Looker Data Sciences, Inc.
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

import datetime
import enum
import keyword
import sys
from typing import Type


def unstructure_hook(converter, api_model):
    """cattr unstructure hook

    Map reserved_ words in models to correct json field names.
    Also handle stripping None fields from dict while setting
    EXPLICIT_NULL fields to None so that we only send null
    in the json for fields the caller set EXPLICIT_NULL on.
    """
    data = converter.unstructure_attrs_asdict(api_model)
    for key, value in data.copy().items():
        if value is None:
            del data[key]
        elif value == "EXPLICIT_NULL":
            data[key] = None
        # bug here: in the unittests cattrs unstructures this correctly
        # as an enum calling .value but in the integration tests we see
        # it doesn't for WriteCreateQueryTask.result_format for some reason
        # Haven't been able to debug it fully, so catching and processing
        # it here.
        elif isinstance(value, enum.Enum):
            data[key] = value.value
    for reserved in keyword.kwlist:
        if f"{reserved}_" in data:
            data[reserved] = data.pop(f"{reserved}_")
    return data


DATETIME_FMT = "%Y-%m-%dT%H:%M:%S.%f%z"
if sys.version_info < (3, 7):
    from dateutil import parser

    def datetime_structure_hook(
        d: str, t: Type[datetime.datetime]
    ) -> datetime.datetime:
        return parser.isoparse(d)

else:

    def datetime_structure_hook(
        d: str, t: Type[datetime.datetime]
    ) -> datetime.datetime:
        return datetime.datetime.strptime(d, DATETIME_FMT)


def datetime_unstructure_hook(dt):
    return dt.strftime(DATETIME_FMT)


def tr_data_keys(data):
    """Map top level json keys to model property names.

    Currently this translates reserved python keywords like "from" => "from_"
    """
    for reserved in keyword.kwlist:
        if reserved in data and isinstance(data, dict):
            data[f"{reserved}_"] = data.pop(reserved)
    return data
