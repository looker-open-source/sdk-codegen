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
            LOOKER_CLIENT_ID -> client_id
            LOOKER_CLIENT_SECRET -> client_secret
        """

        config_data = cls.read_ini(filename, section)

        api_version = cast(str, os.getenv("LOOKER_API_VERSION"))
        if api_version:
            config_data["api_version"] = api_version

        env_base_url = cast(str, os.getenv("LOOKER_BASE_URL"))
        if env_base_url:
            config_data["base_url"] = env_base_url

        required = ["base_url", "client_id", "client_secret"]
        missing = []
        for param in required:
            if not (config_data.get(param) or os.getenv(f"LOOKER_{param.upper()}")):
                missing.append(param)
        if missing:
            raise error.SDKError(
                f"Required parameters not found: {(', ').join(missing)}"
            )

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
            config_data["_section"] = cast(str, section)
            config_data["_filename"] = cast(str, filename)
        return config_data
