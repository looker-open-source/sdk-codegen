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
from typing import cast, Dict, Optional, Sequence, Tuple
import requests
import json
import re

"""API error class
"""


@attr.s(auto_attribs=True, kw_only=True)
class ErrorDetail:
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
    error_doc_url: str = ""
    error_doc: str = ""


@attr.s(auto_attribs=True)
class SDKError(Exception):
    """API error class:
    message: main error info message
    errors: array of error details
    documentation_url: documentation link
    """

    message: str
    errors: Sequence[ErrorDetail] = attr.ib(default=[], kw_only=True)
    documentation_url: str = attr.ib(default="", kw_only=True)
    error_doc_url: str = ""
    error_doc: str = ""


"""Error Doc Helper class
"""


@attr.s(auto_attribs=True, kw_only=True)
class ErrorDocHelper:
    """Error Doc Helper:
    error_doc_url: link
    """

    ERROR_CODES_URL: str = "https://static-a.cdn.looker.app/errorcodes/"
    lookup_dict: Dict[str, Dict[str, str]] = {}
    RE_PATTERN: str = (
        """(https://docs\.looker\.com/r/err/|https://cloud\.google\.com/looker/docs/r/err/)(.*)/(\d{3})(.*)"""
    )
    pattern = re.compile(RE_PATTERN)

    def get_index(self, url: str = ERROR_CODES_URL) -> None:
        r = requests.get(f"{url}index.json")
        self.lookup_dict = json.loads(r.text)

    def lookup(
        self, url: str = ERROR_CODES_URL, code: str = "", path: str = ""
    ) -> Tuple[str, str]:
        if len(self.lookup_dict) == 0:
            self.get_index(url=url)

        error_doc_url: str = ""
        error_doc: str = ""
        if path:
            try:
                error_doc_url = self.lookup_dict[f"{code}{path}"]["url"]
            except KeyError:
                error_doc = f"### No documentation found for {code}{path}"
        if not error_doc_url:
            try:
                error_doc_url = self.lookup_dict[code]["url"]
            except KeyError:
                if not error_doc:
                    error_doc = f"### No documentation found for {code}"

        if error_doc_url:
            r = requests.get(f"{self.ERROR_CODES_URL}{error_doc_url}")
            error_doc = r.text

        return (f"{self.ERROR_CODES_URL}{error_doc_url}", error_doc)

    def parse_and_lookup(
        self, error_url: str, url: str = ERROR_CODES_URL
    ) -> Tuple[str, str]:
        m = re.search(self.RE_PATTERN, error_url)
        if not m:
            return ("", "")

        code: str = cast(Tuple[str, str, str, str], m.groups())[2]
        path: str = cast(Tuple[str, str, str, str], m.groups())[3]
        try:
            return self.lookup(url=url, code=code, path=path)
        except requests.exceptions.RequestException:
            return ("", "")
