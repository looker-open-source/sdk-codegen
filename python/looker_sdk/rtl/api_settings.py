"""Load settings from .ini file and create an ApiSettings object
with the settings as attributes
"""
import configparser as cp
import os
from typing import cast, Dict, Optional

import attr
import cattr

from looker_sdk import error
from looker_sdk.rtl import transport


def _convert_bool(val: str, _: bool) -> bool:
    converted: bool
    if val.lower() in ("yes", "y", "true", "t", "1"):
        converted = True
    elif val.lower() in ("", "no", "n", "false", "f", "0"):
        converted = False
    else:
        raise TypeError
    return converted


@attr.s(auto_attribs=True, kw_only=True)
class ApiSettings(transport.TransportSettings):
    """API Configuration Settings.

    This class can be instantiated directly to provide settings.
    See the configure() method below which provides a convenient
    entry point using a config file and/or environment variables.

    Note that the parent class also has non-default fields that
    need to be supplied.
    """

    _filename: str = ""
    _section: Optional[str] = None

    @classmethod
    def configure(
        cls, filename: str = "looker.ini", section: Optional[str] = None
    ) -> "ApiSettings":
        """Configure using a config file and/or environment variables.

        Environment variables will override config file settings. Neither
        is necessary but some combination must supply the minimum to
        instantiate ApiSettings.

        ENV variables map like this:
            LOOKER_API_VERSION -> api_version
            LOOKER_BASE_URL -> base_url
        """

        config_data = cls.read_ini(filename, section)

        env_api_version = cast(str, os.getenv("LOOKER_API_VERSION"))
        if env_api_version:
            config_data["api_version"] = env_api_version

        env_base_url = cast(str, os.getenv("LOOKER_BASE_URL"))
        if env_base_url:
            config_data["base_url"] = env_base_url

        if not config_data.get("base_url"):
            raise error.SDKError(f"Required parameter base_url not found.")

        converter = cattr.Converter()
        converter.register_structure_hook(bool, _convert_bool)
        settings: ApiSettings = converter.structure(config_data, cls)
        return settings

    @staticmethod
    def read_ini(filename: str, section: Optional[str] = None) -> Dict[str, str]:
        cfg_parser = cp.ConfigParser()
        try:
            cfg_parser.read_file(open(filename))
        except FileNotFoundError:
            config_data: Dict[str, str] = {}
        else:
            # If section is not specified, use first section in file
            section = section or cfg_parser.sections()[0]
            config_data = dict(cfg_parser[section])
            # If setting is an empty string, remove it
            for setting in list(config_data):
                if config_data[setting] in ['""', "''"]:
                    config_data.pop(setting)
            config_data["_section"] = cast(str, section)
            config_data["_filename"] = cast(str, filename)
        return config_data
