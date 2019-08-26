"""Load settings from .ini file and create an ApiSettings object
with the settings as attributes
"""
import configparser as cp
import os
from typing import cast, Optional

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


@attr.s(auto_attribs=True)
class ApiSettings(transport.TransportSettings):
    """API Configuration Settings.
    """

    client_id: str = attr.ib(kw_only=True)
    client_secret: str = attr.ib(kw_only=True)
    embed_secret: str = attr.ib(default="", kw_only=True)
    # User ID to impersonate (optional)
    user_id: str = attr.ib(default="", kw_only=True)
    verbose: bool = attr.ib(default=False, kw_only=True)

    @classmethod
    def configure(
        cls, filename: str = "looker.ini", section: Optional[str] = None
    ) -> "ApiSettings":
        """ApiSettings with attributes configured as per config file.
        """
        cfg_parser = cp.ConfigParser()
        cfg_parser.read_file(open(filename))

        # If section is not specified, use first section in file
        section = section or cfg_parser.sections()[0]

        cfg = dict(cfg_parser[section])

        env_base_url = cast(str, os.getenv("LOOKER_BASE_URL"))
        env_client_id = cast(str, os.getenv("LOOKER_CLIENT_ID"))
        env_client_secret = cast(str, os.getenv("LOOKER_CLIENT_SECRET"))
        env_embed_secret = cast(str, os.getenv("LOOKER_EMBED_SECRET"))
        if env_base_url:
            cfg["base_url"] = env_base_url
        if env_client_id:
            cfg["client_id"] = env_client_id
        if env_client_secret:
            cfg["client_secret"] = env_client_secret
        if env_embed_secret:
            cfg["embed_secret"] = env_embed_secret

        # Remove required params from config dictionary if they are empty strings
        required_params = ["base_url", "client_id", "client_secret"]
        for key, val in list(cfg.items()):
            if key in required_params and not val:
                cfg.pop(key)

        converter = cattr.Converter()
        converter.register_structure_hook(bool, _convert_bool)
        settings: ApiSettings = converter.structure(cfg, cls)
        return settings
