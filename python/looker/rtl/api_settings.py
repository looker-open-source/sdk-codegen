"""Load settings from .ini file and create an ApiSettings object 
with the settings as attributes
"""

import configparser as cp
import dataclasses as dc
import undictify as ud


@ud.type_checked_constructor(convert=True)
@dc.dataclass(frozen=True)
class ApiSettings():
    """Base URL for API"""
    base_url: str
    """API 3 Client ID from Admin|Users"""
    client_id: str
    """API 3 Client Secret from Admin|Users"""
    client_secret: str
    """SSO Embed secret"""
    embed_secret: str = ''
    """User ID to impersonate (optional)"""
    user_id: str = ''
    """API Version"""
    api_version: str = '3.1'
    """SSL certificate verification. Should always be true unless developing locally"""
    verify_ssl: bool = True
    verbose: bool = False

    @classmethod
    def configure(cls, filename: str = 'looker.ini', section: str = None):
        """Return an instance of ApiSettings with attributes configured as per config file."""
        cfg_parser = cp.ConfigParser()
        cfg_parser.read_file(open(filename))

        # If section is not specified, use first section in file
        section = section or cfg_parser.sections()[0]

        return cls(**cfg_parser[section])
