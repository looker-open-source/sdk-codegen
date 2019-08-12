# -*- coding: utf-8 -*-

"""The setup script."""

from setuptools import setup, find_packages  # noqa: H301

NAME = "LookerSDK"
VERSION = "0.1.3"
REQUIRES = ["requests >= 2.22", "attrs", "cattrs"]


setup(
    author="Looker Data Sciences, Inc.",
    author_email="support@looker.com",
    description="Looker API 3.1",
    install_requires=REQUIRES,
    license="LICENSE.txt",
    long_description=open("README.txt").read(),
    keywords=["LookerSDK", "Looker API 3.1"],
    name=NAME,
    package_data={"looker": ["py.typed"]},
    packages=find_packages(),
    url="https://pypi.python.org/pypi/LookerSDK",
    version=VERSION,
)
