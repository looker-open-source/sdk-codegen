# -*- coding: utf-8 -*-

"""The setup script."""

from setuptools import setup, find_packages  # noqa: H301

NAME = "LookerSDK"
VERSION = "0.1.0"
REQUIRES = ["requests >= 2.22", "attr", "cattr"]

setup_requirements = ["pytest-runner"]

test_requirements = ["pytest"]

setup(
    author="Looker Data Sciences, Inc.",
    author_email="support@looker.com",
    description="Looker API 3.1",
    install_requires=REQUIRES,
    license="LICENSE.txt",
    long_description=open("README.txt").read(),
    keywords=["LookerSDK", "Looker API 3.1"],
    name=NAME,
    packages=find_packages(include=["looker"]),
    setup_requires=setup_requirements,
    test_suite="tests",
    tests_require=test_requirements,
    url="https://pypi.python.org/pypi/LookerSDK",
    version=VERSION,
)
