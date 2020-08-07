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

"""Base model for all generated models
"""

import collections
import enum
import keyword
from typing import Any, cast, Iterable, Sequence, Optional, TypeVar

try:
    from typing import ForwardRef  # type: ignore
except ImportError:
    from typing import _ForwardRef as ForwardRef  # type: ignore

import cattr


EXPLICIT_NULL = cast(Any, "EXPLICIT_NULL")  # type:ignore


class Model:
    """Base model for all generated models.
    """

    def _key_to_attr(self, key):
        """Appends the trailing _ to python reserved words.
        """
        if key[-1] == "_":
            raise KeyError(key)
        if key in keyword.kwlist:
            key = f"{key}_"
        return key

    def __getitem__(self, key):
        key = self._key_to_attr(key)
        try:
            ret = getattr(self, key)
        except AttributeError:
            raise KeyError(key)

        if isinstance(ret, enum.Enum):
            ret = ret.value
        if ret is None:
            raise KeyError(key)
        return ret

    def __setitem__(self, key, value):
        key = self._key_to_attr(key)
        if not hasattr(self, key):
            raise AttributeError(
                f"'{self.__class__.__name__}' object has no attribute '{key}'"
            )
        annotation = self.__annotations__[key]
        if isinstance(annotation, ForwardRef):
            actual_type = eval(
                annotation.__forward_arg__, self.__global_context, locals()
            )
            if isinstance(actual_type, enum.EnumMeta):

                # untyped because mypy really doesn't like this enum internals stuff
                def err(val):
                    valid = []
                    for v in actual_type.__members__.values():
                        if v.value != "invalid_api_enum_value":
                            valid.append(v.value)
                    return (
                        f"Invalid value '{val}' for "  # type: ignore
                        f"'{self.__class__.__name__}.{key}'. Valid values are "
                        f"{valid}"  # type: ignore
                    )

                if isinstance(value, actual_type):
                    raise ValueError(err(value))
                enum_member = actual_type(value)
                if enum_member.value == "invalid_api_enum_value":
                    raise ValueError(err(value))
                value = enum_member
            elif issubclass(actual_type, Model):
                value = cattr.structure(value, actual_type)

        return setattr(self, key, value)

    def __delitem__(self, key):
        self[key]  # validates key
        setattr(self, self._key_to_attr(key), None)

    def __iter__(self):
        return iter(cattr.unstructure(self))

    def __len__(self):
        return len(cattr.unstructure(self))

    def __contains__(self, key):
        return key in cattr.unstructure(self)

    def keys(self):
        return cattr.unstructure(self).keys()

    def items(self):
        return cattr.unstructure(self).items()

    def values(self):
        return cattr.unstructure(self).values()

    def get(self, key, default=None):
        try:
            return self[key]
        except KeyError:
            return default

    def pop(self, key, default=None):
        ret = self.get(key, default)
        if key in self:
            del self[key]
        return ret

    def popitem(self):
        raise NotImplementedError()

    def clear(self):
        raise NotImplementedError()

    def update(self, iterable=None, **kwargs):
        if iterable:
            has_keys = getattr(iterable, "keys", None)
            if callable(has_keys):
                for k in iterable:
                    self[k] = iterable[k]
            else:
                for k, v in iterable:
                    self[k] = v
        for k in kwargs:
            self[k] = kwargs[k]

    def setdefault(self, key, default=None):
        if key not in self:
            self[key] = default
        return self[key]

    def copy(self):
        raise NotImplementedError()


def safe_enum__new__(cls, value):
    """Handle out-of-spec enum values returned by API.

    This is achieved by overriding the __new__ method to return
    `invalid_api_enum_value` (defined on each subclass) when an
    unexpected value for the enum is returned by the API.
    """
    if not isinstance(value, (str, int, bool)):
        return super().__new__(cls, value)
    else:
        vals = {v.value: v for v in cls.__members__.values()}
        return vals.get(value, cls.invalid_api_enum_value)


T = TypeVar("T")


class DelimSequence(collections.UserList, Sequence[T]):
    def __init__(
        self,
        data: Optional[Sequence[T]] = None,
        prefix: str = "",
        suffix: str = "",
        separator: str = ",",
    ):
        self.prefix = prefix
        self.suffix = suffix
        self.separator = separator

        super().__init__(data)

    def append(self, elem: T):
        super().append(elem)

    def extend(self, iterable: Iterable[T]):
        super().extend(iterable)

    def insert(self, i: int, elem: T):
        super().insert(i, elem)

    def remove(self, elem: T):
        super().remove(elem)

    def index(self, x: T, *args):
        super().index(x, *args)  # type: ignore

    def count(self, elem: T):
        super().count(elem)

    def __str__(self):
        return (
            f"{self.prefix}"
            f"{self.separator.join(str(d) for d in self.data)}"
            f"{self.suffix}"
        )
