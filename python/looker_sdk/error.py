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

import attr
from typing  import Optional, Sequence

"""API error class
"""

@attr.s(auto_attribs=True, kw_only=True)
class ErrorDetail():
    """Error detail:
        documentation_url: documentation link
        field: field with error
        code: error code
        message: error info message
    """
    documentation_url: str
    field: Optional[str] = ""
    code: Optional[str] = ""
    message: Optional[str] = ""


@attr.s(auto_attribs=True)
class SDKError(Exception):
    """API error class:
        message: main error info message
        errors: array of error details
        documentation_url: documentation link
    """

    message: str
    errors: Optional[Sequence[ErrorDetail]] = attr.ib(default=[], kw_only=True)
    documentation_url: Optional[str] = attr.ib(default="", kw_only=True)
