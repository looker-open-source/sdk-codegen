# pylint: disable=C,R
# pylint: disable=redefined-outer-name

import pytest  # type: ignore

from looker_sdk import error
from looker_sdk.rtl import api_settings


@pytest.fixture(scope="module")
def config_file(tmpdir_factory):
    """Creates a sample looker.ini file and returns its path"""
    filename = tmpdir_factory.mktemp("settings").join("looker.ini")
    filename.write(
        """
[Looker]
# API version
api_version=3.1
# Base URL for API. Do not include /api/* in the url
base_url=https://host1.looker.com:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
# Optional embed secret for SSO embedding
embed_secret=your_embed_SSO_secret
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True

[OLD_API]
api_version=3.0
base_url=https://host2.looker.com:19999
client_id=your_API3_client_id
client_secret=your_API3_client_secret
embed_secret=your_embed_SSO_secret
verify_ssl=True

[BARE_MINIMUM]
base_url=https://host3.looker.com:19999/
client_id=myclientid
client_secret=myclientsecret

[BARE]
# Empty section
[BARE_MIN_NO_VALUES]
base_url=https://host3.looker.com:19999/
client_id=""
client_secret=

[MISSING_BASE_URL]
client_id=your_API3_client_id
client_secret=your_API3_client_secret
"""
    )
    return filename


def test_settings_defaults_to_looker_section(config_file):
    """ApiSettings should retrieve settings from default (Looker) section
    if section is not specified during instantiation.
    """
    settings = api_settings.ApiSettings.configure(config_file)
    assert settings.base_url == "https://host1.looker.com:19999"
    assert not hasattr(settings, "client_id")
    assert not hasattr(settings, "client_secret")


@pytest.mark.parametrize(
    "test_section, expected_url, expected_api_version",
    [
        ("Looker", "https://host1.looker.com:19999", "3.1"),
        ("OLD_API", "https://host2.looker.com:19999", "3.0"),
    ],
    ids=["section=Looker", "section=OLD_API"],
)
def test_it_retrieves_section_by_name(
    config_file, test_section, expected_url, expected_api_version
):
    """ApiSettings should return settings of specified section.
    """
    settings = api_settings.ApiSettings.configure(config_file, test_section)
    assert settings.base_url == expected_url
    assert settings.api_version == expected_api_version
    assert not hasattr(settings, "client_id")
    assert not hasattr(settings, "client_secret")


def test_it_assigns_defaults_to_empty_settings(config_file):
    """ApiSettings assigns Nones to optional settings that are empty in the
    config file.
    """
    settings = api_settings.ApiSettings.configure(config_file, "BARE_MINIMUM")
    assert settings.api_version == "3.1"
    assert settings.base_url == "https://host3.looker.com:19999/"
    assert settings.verify_ssl
    assert not hasattr(settings, "client_id")
    assert not hasattr(settings, "client_secret")


def test_it_fails_with_a_bad_section_name(config_file):
    """ApiSettings should raise an error if section is not found."""
    with pytest.raises(KeyError) as exc_info:
        api_settings.ApiSettings.configure(config_file, "NotAGoodLookForYou")
    assert exc_info.match("NotAGoodLookForYou")


@pytest.mark.parametrize(
    "test_url, expected_url",
    [
        pytest.param(
            "https://host1.looker.com:19999",
            "https://host1.looker.com:19999/api/3.1",
            id="Without trailing forward slash",
        ),
        pytest.param(
            "https://host1.looker.com:19999/",
            "https://host1.looker.com:19999/api/3.1",
            id="With trailing forward slash",
        ),
    ],
)
def test_versioned_api_url_is_built_properly(config_file, test_url, expected_url):
    """ApiSettings.url should append the api version to the base url.
    """
    settings = api_settings.ApiSettings.configure(config_file)
    settings.base_url = test_url
    assert settings.url == expected_url


@pytest.mark.parametrize(
    "test_section",
    [
        pytest.param("BARE", id="Empty config file"),
        pytest.param("BARE_MINIMUM", id="Overriding with env variables"),
    ],
)
def test_credentials_from_env_variables_override_config_file(
    monkeypatch, config_file, test_section
):
    """ApiSettings should read settings defined as env variables.
    """
    monkeypatch.setenv("LOOKER_BASE_URL", "https://host1.looker.com:19999")
    monkeypatch.setenv("LOOKER_CLIENT_ID", "id123")
    monkeypatch.setenv("LOOKER_CLIENT_SECRET", "secret123")

    settings = api_settings.ApiSettings.configure(config_file, section=test_section)
    assert settings.base_url == "https://host1.looker.com:19999"
    assert not hasattr(settings, "client_id")
    assert not hasattr(settings, "client_secret")


def test_configure_with_no_file(monkeypatch):
    """ApiSettings should be instantiated if required parameters all exist in env 
    variables.
    """
    monkeypatch.setenv("LOOKER_BASE_URL", "https://host1.looker.com:19999")
    monkeypatch.setenv("LOOKER_CLIENT_ID", "id123")
    monkeypatch.setenv("LOOKER_CLIENT_SECRET", "secret123")

    settings = api_settings.ApiSettings.configure("no-such-file")
    assert settings.base_url == "https://host1.looker.com:19999"
    assert not hasattr(settings, "client_id")
    assert not hasattr(settings, "client_secret")


@pytest.mark.parametrize(
    "test_section",
    [
        pytest.param("BARE", id="Empty config file"),
        pytest.param("BARE_MIN_NO_VALUES", id="Required settings are empty strings"),
        pytest.param("MISSING_BASE_URL", id="Missing base url"),
    ],
)
def test_it_fails_if_required_settings_are_not_found(config_file, test_section):
    """ApiSettings should throw an error if required settings are not found.
    """
    with pytest.raises(error.SDKError):
        api_settings.ApiSettings.configure(config_file, test_section)


def test_it_fails_when_env_variables_are_defined_but_empty(config_file, monkeypatch):
    """ApiSettings should throw an error if env variables are defined but empty.
    """
    monkeypatch.setenv("LOOKER_CLIENT_ID", "")
    monkeypatch.setenv("LOOKER_CLIENT_SECRET", "")

    with pytest.raises(error.SDKError):
        api_settings.ApiSettings.configure(config_file, "BARE_MIN_NO_VALUES")
