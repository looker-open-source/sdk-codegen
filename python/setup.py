# -*- coding: utf-8 -*-

"""The setup script."""

from setuptools import setup, find_packages  # noqa: H301

NAME = "looker_sdk"
VERSION = "0.1.3b3"
REQUIRES = ["requests >= 2.22", "attrs", "cattrs >= 1.0.0rc0"]


setup(
    author="Looker Data Sciences, Inc.",
    author_email="support@looker.com",
    description="Looker API 3.1",
    install_requires=REQUIRES,
    license="MIT",
    long_description=open("README.rst").read(),
    keywords=["looker_sdk", "Looker API 3.1"],
    name=NAME,
    package_data={"looker_sdk": ["py.typed", "looker_sdk/looker-sample.ini"]},
    packages=find_packages(),
    url="https://pypi.python.org/pypi/looker_sdk",
    version=VERSION,
)
