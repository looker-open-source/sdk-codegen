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

"""The setup script."""

from setuptools import setup, find_packages  # noqa: H301

version = {}
with open("looker_sdk/version.py") as fp:
    exec(fp.read(), version)

NAME = "looker_sdk"
VERSION = version["__version__"]
REQUIRES = [
    "requests >= 2.22",
    # Python 3.6
    "attrs >= 18.2.0;python_version<'3.7'",
    "cattrs < 1.1.0;python_version<'3.7'",
    "python-dateutil;python_version<'3.7'",
    # Python 3.7+
    "attrs >= 20.1.0;python_version>='3.7'",
    "cattrs == 1.1.2;python_version>='3.7'",
    "typing-extensions;python_version<'3.8'",
]


setup(
    author="Looker Data Sciences, Inc.",
    author_email="support@looker.com",
    description="Looker API 3.1",
    install_requires=REQUIRES,
    license="MIT",
    long_description=open("README.rst").read(),
    long_description_content_type="text/x-rst",
    keywords=["Looker", "Looker API", "looker_sdk", "Looker API 3.1"],
    name=NAME,
    package_data={"looker_sdk": ["py.typed", "looker_sdk/looker-sample.ini"]},
    packages=find_packages(),
    python_requires="~=3.6",
    url="https://pypi.python.org/pypi/looker_sdk",
    version=VERSION,
)
