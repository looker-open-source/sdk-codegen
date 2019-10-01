# The MIT License (MIT)
#
# Copyright (c) 2019 Looker Data Sciences, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

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
from looker_sdk.rtl import constants


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
            <package-prefix>_API_VERSION -> api_version
            <package-prefix>_BASE_URL -> base_url
            <package-prefix>_VERIFY_SSL -> verify_ssl
        """

        config_data = cls.read_ini(filename, section)

        env_api_version = cast(
            str, os.getenv(f"{constants.environment_prefix}_API_VERSION")
        )
        if env_api_version:
            config_data["api_version"] = env_api_version

        env_base_url = cast(str, os.getenv(f"{constants.environment_prefix}_BASE_URL"))
        if env_base_url:
            config_data["base_url"] = env_base_url

        env_verify_ssl = cast(
            str, os.getenv(f"{constants.environment_prefix}_VERIFY_SSL")
        )
        if env_verify_ssl:
            config_data["verify_ssl"] = env_verify_ssl

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
                if config_data[setting] in ['""', "''", ""]:
                    config_data.pop(setting)
            config_data["_section"] = cast(str, section)
            config_data["_filename"] = cast(str, filename)
        return config_data
