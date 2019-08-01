# pylint: disable=redefined-outer-name
import configparser
import pytest  # type: ignore

from looker.rtl import api_settings


@pytest.fixture(scope='session')
def config_file(tmpdir_factory):
    """Creates a sample looker.ini file and returns its path"""
    filename = tmpdir_factory.mktemp('settings').join('looker.ini')
    filename.write("""
[Looker]
# API version is required
api_version=3.1
# Base URL for API. Do not include /api/* in the url
base_url=https://host1.looker.com:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
# Optional embed secret for SSO embedding
embed_secret=your_embed_SSO_secret
# Optional user_id to impersonate
user_id=
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True
# leave verbose off by default
verbose=false

[Looker2]
api_version=3.0
base_url=https://host2.looker.com:19999
client_id=your_API3_client_id
client_secret=your_API3_client_secret
embed_secret=your_embed_SSO_secret
user_id=
verify_ssl=True

[Looker3]
base_url=https://host3.looker.com:19999/
client_id=myclientid
client_secret=myclientsecret
        """)
    return filename


def test_settings_defaults_to_looker_section(config_file):
    """ApiSettings should retrieve settings from default (Looker) section
    if section is not specified during instantiation."""
    settings = api_settings.ApiSettings.configure(config_file)
    assert settings.base_url == 'https://host1.looker.com:19999'


@pytest.mark.parametrize("test_section, expected_url",
                         [('Looker', 'https://host1.looker.com:19999'),
                          ('Looker2', 'https://host2.looker.com:19999')],
                         ids=['section=Looker', 'section=Looker2'])
def test_it_retrieves_section_by_name(config_file, test_section, expected_url):
    """ApiSettings should return settings of specified section."""
    settings = api_settings.ApiSetting.configure(config_file, test_section)
    assert settings.base_url == expected_url


def test_it_assigns_defaults_to_empty_settings(config_file):
    """ApiSettings assigns Nones to optional settings that are empty in the config file"""
    settings = api_settings.ApiSetting.configure(config_file, 'Looker3')
    assert settings.api_version == '3.1'
    assert settings.base_url == 'https://host3.looker.com:19999/'
    assert settings.client_id == 'myclientid'
    assert settings.client_secret == 'myclientsecret'
    assert settings.embed_secret == ''
    assert settings.user_id == ''
    assert settings.verify_ssl
    assert settings.verbose is False


def test_it_fails_with_a_bad_section_name(config_file):
    """ApiSettings should raise an error if section is not found."""
    with pytest.raises(configparser.NoSectionError) as exc_info:
        api_settings.ApiSettings.configure(config_file, 'NotAGoodLookForYou')
    assert exc_info.value.message == "No section: 'NotAGoodLookForYou'"


def test_it_fails_with_a_bad_filename():
    """ApiSettings should error if config file is not found."""
    with pytest.raises(FileNotFoundError) as exc_info:
        api_settings.ApiSettings.configure('random_file.ini')
    assert str(exc_info.value).endswith(
        "No such file or directory: 'random_file.ini'")


@pytest.mark.parametrize("test_url, expected_url",
                         [('https://host1.looker.com:19999',
                           'https://host1.looker.com:19999/api/3.1'),
                          ('https://host1.looker.com:19999/',
                           'https://host1.looker.com:19999/api/3.1')])
def test_versioned_api_url_is_built_properly(config_file, test_url,
                                             expected_url):
    """ApiSettings.url should append the api version to the base url"""
    settings = api_settings.ApiSettings.configure(config_file)
    settings.base_url = test_url
    assert settings.url == expected_url
