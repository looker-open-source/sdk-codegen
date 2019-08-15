"""Client entry point
"""
from looker_sdk.sdk import methods


def setup(config_file: str = "Looker.ini") -> methods.LookerSDK:
    return methods.LookerSDK.configure(config_file)
