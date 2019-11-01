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
from typing import Any, cast, Iterable, Sequence, Optional, TypeVar


EXPLICIT_NULL = cast(Any, "EXPLICIT_NULL")  # type:ignore


class Model:
    """Base model for all generated models.
    """


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
