# coding: utf-8

from setuptools import setup, find_packages  # noqa: H301

NAME = "LookerSDK"
VERSION = "0.5.0"

# To install the library, run the following
#
# python setup.py install
#
# prerequisite: setuptools
# http://pypi.python.org/pypi/setuptools

REQUIRES = ["requests >= 2.22", "certifi", "python-dateutil"]

setup(
    name=NAME,
    version=VERSION,
    description="Looker API 3.1",
    author="Looker Data Sciences, Inc.",
    author_email="support@looker.com",
    url="https://pypi.python.org/pypi/LookerSDK",
    license="LICENSE.txt",
    keywords=["LookerSDK", "Looker API 3.1"],
    install_requires=REQUIRES,
    packages=find_packages(),
    include_package_data=True,
    long_description=open("README.txt").read(),
)
