# coding: utf-8

from setuptools import setup, find_packages  # noqa: H301

NAME = "looker"
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
    author_email="support@looker.com",
    url="",
    keywords=["LookerSDK", "Looker API 3.1"],
    install_requires=REQUIRES,
    packages=find_packages(),
    include_package_data=True,
    long_description="""\
    This is the preferred API version for Looker    # noqa: E501
    """
)
