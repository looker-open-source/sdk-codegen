import configparser
import sys

Config = configparser.ConfigParser()

class ApiSettings(object):
    """API settings uses `looker.ini`"""
    def __init__(self, filename: str="looker.ini"):
        self._api_version: str = "3.1"
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
        self.read(self.config_file)

    @staticmethod
    def configSectionMap(section: str):
        """Create a dictionary (map) for settings in the specified section"""
        dict1 = {}
        items = Config.options(section)
        for item in items:
            try:
                dict1[item] = Config.get(section, item)
            except:
                dict1[item] = None
        return dict1

    def read(self, filename: str="looker.ini"):
        """Read the specified configuration file and load its values"""
        self.config_file = filename
        Config.read(self.config_file)
        section = "Looker"
        config_map = ApiSettings.configSectionMap(section)
        self.api_version = config_map["api_version"]
        self.base_url = config_map["base_url"]
        self.client_id = config_map["client_id"]
        self.client_secret = config_map["client_secret"]
        self.embed_secret = config_map["embed_secret"]
        self.user_id = config_map["user_id"]
        self.verbose = Config.getboolean(section, "verbose")
        self.verify_ssl = Config.getboolean(section, "verify_ssl")

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
    def base_url(self, value: str) -> str:
        self._base_url = value
        self._url = None

    @property
    def url(self) -> str:
        """API-versioned base endpoint"""
        if self._url is None:
            self._url = "{}{}api/{}".format(self.base_url, "" if self.base_url.endswith("/") else "/", self.api_version)
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
