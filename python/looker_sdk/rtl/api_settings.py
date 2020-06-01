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
import sys
from typing import Dict, Optional, Set
import warnings

from looker_sdk.rtl import transport
from looker_sdk.rtl import constants

if sys.version_info >= (3, 8):
    from typing import Protocol
else:
    from typing_extensions import Protocol


class PApiSettings(transport.PTransportSettings, Protocol):
    def read_config(self) -> Dict[str, str]:
        ...


_DEFAULT_INI = "looker.ini"


class ApiSettings(PApiSettings):
    deprecated_settings: Set[str] = {"api_version", "embed_secret", "user_id"}

    def __init__(self, filename: str = _DEFAULT_INI, section: Optional[str] = None):
        """Configure using a config file and/or environment variables.

        Environment variables will override config file settings. Neither
        is necessary but some combination must supply the minimum to
        instantiate ApiSettings.

        ENV variables map like this:
            <package-prefix>_BASE_URL -> base_url
            <package-prefix>_VERIFY_SSL -> verify_ssl

        Args:
            filename (str): config file. If specified, the file must exist.
                If not specified and the default value of "looker.ini" does not
                exist then no error is raised.
            section (str): section in config file. If not supplied default to
                reading first section.
        """
        self.filename = filename
        self.section = section
        data = self.read_config()
        verify_ssl = data.get("verify_ssl")
        if verify_ssl is None:
            self.verify_ssl = True
        else:
            self.verify_ssl = self._bool(verify_ssl)
        self.base_url = data.get("base_url", "")
        self.timeout = int(data.get("timeout", 120))
        self.headers = {"Content-Type": "application/json"}
        self.agent_tag = f"{transport.AGENT_PREFIX} {constants.sdk_version}"

    def read_config(self) -> Dict[str, str]:
        cfg_parser = cp.ConfigParser()
        try:
            config_file = open(self.filename)
        except FileNotFoundError as ex:
            # handle undocumented case of caller specifying empty string
            # to "explicitly" negate config file. best practice is to
            # simply not specify a filename argument to the constructor
            if self.filename == _DEFAULT_INI or not self.filename:
                data: Dict[str, str] = {}
            else:
                raise ex
        else:
            cfg_parser.read_file(config_file)
            config_file.close()
            # If section is not specified, use first section in file
            section = self.section or cfg_parser.sections()[0]
            if not cfg_parser.has_section(section):
                raise cp.NoSectionError(section)
            data = dict(cfg_parser[section])

        data.update(self._override_from_env())
        return self._clean_input(data)

    @staticmethod
    def _bool(val: str) -> bool:
        if val.lower() in ("yes", "y", "true", "t", "1"):
            converted = True
        elif val.lower() in ("", "no", "n", "false", "f", "0"):
            converted = False
        else:
            raise TypeError
        return converted

    @staticmethod
    def _override_from_env() -> Dict[str, str]:
        overrides = {}
        env_prefix = constants.environment_prefix
        base_url = os.getenv(f"{env_prefix}_BASE_URL")
        if base_url:
            overrides["base_url"] = base_url

        verify_ssl = os.getenv(f"{env_prefix}_VERIFY_SSL")
        if verify_ssl:
            overrides["verify_ssl"] = verify_ssl

        timeout = os.getenv(f"{env_prefix}_TIMEOUT")
        if timeout:
            overrides["timeout"] = timeout

        client_id = os.getenv(f"{env_prefix}_CLIENT_ID")
        if client_id:
            overrides["client_id"] = client_id

        client_secret = os.getenv(f"{env_prefix}_CLIENT_SECRET")
        if client_secret:
            overrides["client_secret"] = client_secret

        return overrides

    def _clean_input(self, data: Dict[str, str]) -> Dict[str, str]:
        """Remove surrounding quotes and discard empty strings.
        """
        cleaned = {}
        for setting, value in data.items():
            if setting in self.deprecated_settings:
                warnings.warn(
                    message=DeprecationWarning(
                        f"'{setting}' config setting is deprecated"
                    )
                )
            # Remove empty setting values
            if value in ['""', "''", ""]:
                continue
            # Strip quotes from setting values
            elif value.startswith(('"', "'")) or value.endswith(('"', "'")):
                cleaned[setting] = value.strip("\"'")
            else:
                cleaned[setting] = value
        return cleaned
