"""Load settings from .ini file and create an ApiSettings object
with the settings as attributes
"""
import configparser as cp
import os
from typing import cast, Dict, Optional

import attr
import cattr

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

    client_id: str
    client_secret: str
    embed_secret: str = ""

    @classmethod
    def configure(
        cls, filename: str = "looker.ini", section: Optional[str] = None
    ) -> "ApiSettings":
        """Configure using a config file and/or environment variables.

        Environment variables will override config file settings. Neither
        is necessary but some combination must supply the minimum to
        instantiate ApiSettings.

        ENV variables map like this:
            LOOKER_BASE_URL -> base_url
            LOOKER_CLIENT_ID -> client_id
            LOOKER_CLIENT_SECRET -> client_secret
            LOOKER_EMBED_SECRET -> embed_secret

        """
        cfg_parser = cp.ConfigParser()
        try:
            cfg_parser.read_file(open(filename))
        except FileNotFoundError:
            config_data: Dict[str, str] = {}
        else:
            # If section is not specified, use first section in file
            section = section or cfg_parser.sections()[0]
            config_data = dict(cfg_parser[section])

        env_base_url = cast(str, os.getenv("LOOKER_BASE_URL"))
        if env_base_url:
            config_data["base_url"] = env_base_url

        env_client_id = cast(str, os.getenv("LOOKER_CLIENT_ID"))
        if env_client_id:
            config_data["client_id"] = env_client_id

        env_client_secret = cast(str, os.getenv("LOOKER_CLIENT_SECRET"))
        if env_client_secret:
            config_data["client_secret"] = env_client_secret

        env_embed_secret = cast(str, os.getenv("LOOKER_EMBED_SECRET"))
        if env_embed_secret:
            config_data["embed_secret"] = env_embed_secret

        api_version = cast(str, os.getenv("LOOKER_API_VERSION"))
        if api_version:
            config_data["api_version"] = api_version

        # Remove required params from config dictionary if they are empty strings
        required_params = ["base_url", "client_id", "client_secret"]
        for key, val in list(config_data.items()):
            if key in required_params and not val:
                config_data.pop(key)

        converter = cattr.Converter()
        converter.register_structure_hook(bool, _convert_bool)
        settings: ApiSettings = converter.structure(config_data, cls)
        return settings
