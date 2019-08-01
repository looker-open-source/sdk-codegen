"""Load settings from .ini file and create an ApiSettings object
with the settings as attributes
"""

import configparser as cp
from typing import Optional

import attr

from looker.rtl import transport as tp


@attr.s(auto_attribs=True)
class ApiSettings(tp.TransportSettings):
    """API 3 Client ID from Admin|Users"""
    client_id: str
    """API 3 Client Secret from Admin|Users"""
    client_secret: str
    """SSO Embed secret"""
    embed_secret: str = ''
    """User ID to impersonate (optional)"""
    user_id: str = ''
    verbose: bool = False

    @classmethod
    def configure(cls,
                  filename: str = 'looker.ini',
                  section: Optional[str] = None):
        """Return an instance of ApiSettings with attributes configured as per config file."""
        cfg_parser = cp.ConfigParser()
        cfg_parser.read_file(open(filename))

        # If section is not specified, use first section in file
        section = section or cfg_parser.sections()[0]

        return cls(**cfg_parser[section])
