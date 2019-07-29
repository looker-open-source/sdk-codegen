import configparser
import sys

from typing import Dict

CONFIG = configparser.ConfigParser()


# TODO: Determine if this is going to be available through command line
class ApiSettings():
    """API settings uses `looker.ini`"""
    def __init__(self, filename: str = 'looker.ini', section: str = 'Looker'):
        self._api_version: str = '3.1'
        self.verbose: bool = False
        """Configuration file name"""
        self.config_file: str = filename
        """Base URL for API"""
        self._base_url: str = None
        """API 3 Client ID from Admin|Users"""
        self.client_id: str = None
        """API 3 Client Secret from Admin|Users"""
        self.client_secret: str = None
        """SSO Embed secret"""
        self.embed_secret: str = None
        """User ID to impersonate (optional)"""
        self.user_id: str = None
        """Versioned API URL"""
        self._url: str = None
        """SSL certificate verification. Should always be true unless developing locally"""
        self.verify_ssl: bool = True
        self.read(self.config_file, section)

    def read(self, filename: str = "looker.ini", section: str = "Looker"):
        """Read the specified configuration file and load its values"""
        self.config_file = filename
        with open(self.config_file):
            CONFIG.read(self.config_file)

        self.api_version = CONFIG.get(section, "api_version", fallback='3.1')
        self.base_url = CONFIG.get(section, "base_url")
        self.client_id = CONFIG.get(section, "client_id")
        self.client_secret = CONFIG.get(section, "client_secret")
        self.embed_secret = CONFIG.get(section, "embed_secret", fallback='')
        self.user_id = CONFIG.get(section, "user_id", fallback='')
        self.verbose = CONFIG.getboolean(section, "verbose", fallback=False)
        self.verify_ssl = CONFIG.getboolean(section,
                                            "verify_ssl",
                                            fallback=True)

    @property
    def api_version(self) -> str:
        return self._api_version

    @api_version.setter
    def api_version(self, value: str):
        self._url = None
        self._api_version = value

    @property
    def base_url(self) -> str:
        """Base url for API"""
        return self._base_url

    @base_url.setter
    def base_url(self, value: str):
        self._base_url = value
        self._url = None

    @property
    def url(self) -> str:
        """API-versioned base endpoint"""
        if self._url is None:
            self._url = "{}{}api/{}".format(
                self.base_url, "" if self.base_url.endswith("/") else "/",
                self.api_version)
        return self._url

    def assign(self, options):
        """Assign config values overridden with command-line options"""
        # Good to note http://click.pocoo.org/5/utils/#finding-application-folders
        if options.base_url:
            self.base_url = options.base_url
        if options.client_secret:
            self.client_secret = options.client_secret
        if options.client_id:
            self.client_id = options.client_id
        if options.embed_secret:
            self.embed_secret = options.embed_secret
        if options.user_id:
            self.user_id = options.user_id
        if options.verbose != self.verbose:
            self.verbose = options.verbose


if __name__ == "__main__":
    if len(sys.argv) > 1:
        config = ApiSettings(sys.argv[1])
    else:
        config = ApiSettings()
    print(config)
