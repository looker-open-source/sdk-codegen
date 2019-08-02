"""Load settings from .ini file and create an ApiSettings object
with the settings as attributes
"""
import configparser as cp
from typing import Optional

import attr
import cattr

from looker.rtl import transport as tp


@attr.s(auto_attribs=True)
class ApiSettings(tp.TransportSettings):
    """API Configuration Settings.
    """
    client_id: str = attr.ib(kw_only=True)
    client_secret: str = attr.ib(kw_only=True)
    embed_secret: str = attr.ib(default='', kw_only=True)
    # User ID to impersonate (optional)
    user_id: str = attr.ib(default='', kw_only=True)
    verbose: bool = attr.ib(default=False, kw_only=True)

    @classmethod
    def configure(cls,
                  filename: str = 'looker.ini',
                  section: Optional[str] = None) -> 'ApiSettings':
        """Return an instance of ApiSettings with attributes configured as per config file."""
        cfg_parser = cp.ConfigParser()
        cfg_parser.read_file(open(filename))

        # If section is not specified, use first section in file
        section = section or cfg_parser.sections()[0]

        cfg = dict(cfg_parser[section])
        settings: ApiSettings = cattr.structure(cfg, cls)
        return settings
