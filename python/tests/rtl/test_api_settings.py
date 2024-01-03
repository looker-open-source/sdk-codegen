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

import configparser

import pytest  # type: ignore

from looker_sdk import error
from looker_sdk.rtl import api_settings


@pytest.fixture
def config_file(monkeypatch, tmpdir_factory):
    """Creates a sample looker.ini file and returns its path"""
    monkeypatch.delenv("LOOKERSDK_BASE_URL", raising=False)
    monkeypatch.delenv("LOOKERSDK_VERIFY_SSL", raising=False)
    monkeypatch.delenv("LOOKERSDK_CLIENT_ID", raising=False)
    monkeypatch.delenv("LOOKERSDK_CLIENT_SECRET", raising=False)
    filename = tmpdir_factory.mktemp("settings").join("looker.ini")
    filename.write(
        """
[Looker]
# Base URL for API. Do not include /api/* in the url
base_url=https://host1.looker.com:19999
# API client id
client_id=your_API_client_id
# API client secret
client_secret=your_API_client_secret
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True

[OLD_API]
base_url=https://host2.looker.com:19999
client_id=your_API_client_id
client_secret=your_API_client_secret
verify_ssl=

[BARE_MINIMUM]
base_url=https://host3.looker.com:19999/

[BARE]
# Empty section

[BARE_MIN_NO_VALUES]
base_url=""

[QUOTED_CONFIG_VARS]
base_url="https://host4.looker.com:19999"
verify_ssl='false'
"""
    )
    return filename


def test_settings_defaults_to_looker_section(config_file):
    """ApiSettings should retrieve settings from default (Looker) section
    if section is not specified during instantiation.
    """
    settings = api_settings.ApiSettings(filename=config_file)
    assert settings.base_url == "https://host1.looker.com:19999"
    # API credentials are not set as attributes in ApiSettings
    data = vars(settings)
    assert "client_id" not in data
    assert "client_secret" not in data


@pytest.mark.parametrize(
    "test_section, expected_url",
    [
        ("Looker", "https://host1.looker.com:19999"),
        ("OLD_API", "https://host2.looker.com:19999"),
    ],
    ids=["section=Looker", "section=OLD_API"],
)
def test_it_retrieves_section_by_name(config_file, test_section, expected_url):
    """ApiSettings should return settings of specified section."""
    settings = api_settings.ApiSettings(filename=config_file, section=test_section)
    assert settings.base_url == expected_url
    assert settings.verify_ssl
    data = vars(settings)
    assert "client_id" not in data
    assert "client_secret" not in data


def test_it_assigns_defaults_to_empty_settings(config_file):
    """ApiSettings assigns defaults to optional settings that are empty in the
    config file.
    """
    settings = api_settings.ApiSettings(filename=config_file, section="BARE_MINIMUM")
    assert settings.base_url == "https://host3.looker.com:19999/"
    assert settings.verify_ssl
    data = vars(settings)
    assert "client_id" not in data
    assert "client_secret" not in data


def test_it_fails_with_a_bad_section_name(config_file):
    """ApiSettings should raise NoSectionError section is not found."""
    with pytest.raises(configparser.NoSectionError) as exc_info:
        api_settings.ApiSettings(filename=config_file, section="NotAGoodLookForYou")
    assert exc_info.match("NotAGoodLookForYou")


def test_it_fails_with_a_bad_file_path():
    """ApiSettings should raise an error non-default ini path doesn't exist."""
    api_settings.ApiSettings()  # defaulting to _DEFAULT_INIS[0], no error
    api_settings.ApiSettings(
        filename="looker.ini"
    )  # specifying _DEFAULT_INIS[0], no error
    with pytest.raises(FileNotFoundError) as exc_info:
        api_settings.ApiSettings(filename="/no/such/file.ini")
    assert exc_info.match("file.ini")


@pytest.mark.parametrize(
    "test_section",
    [
        pytest.param("BARE", id="Empty config file"),
        pytest.param("BARE_MINIMUM", id="Overriding with env variables"),
    ],
)
def test_settings_from_env_variables_override_config_file(
    monkeypatch, config_file, test_section
):
    """ApiSettings should read settings defined as env variables."""
    monkeypatch.setenv("LOOKERSDK_BASE_URL", "https://host1.looker.com:19999")
    monkeypatch.setenv("LOOKERSDK_VERIFY_SSL", "0")
    monkeypatch.setenv("LOOKERSDK_CLIENT_ID", "id123")
    monkeypatch.setenv("LOOKERSDK_CLIENT_SECRET", "secret123")

    settings = api_settings.ApiSettings(
        filename=config_file, section=test_section, env_prefix="LOOKERSDK"
    )
    assert settings.base_url == "https://host1.looker.com:19999"
    assert not settings.verify_ssl
    # API credentials are still not set as attributes when read from env variables
    data = vars(settings)
    assert "client_id" not in data
    assert "client_secret" not in data


@pytest.mark.parametrize(
    "test_value, expected",
    [
        ("yes", True),
        ("y", True),
        ("true", True),
        ("t", True),
        ("1", True),
        ("", True),
        ("no", False),
        ("n", False),
        ("f", False),
        ("0", False),
    ],
)
def test_env_verify_ssl_maps_properly(monkeypatch, config_file, test_value, expected):
    """ApiSettings should map the various values that VERIFY_SSL can take to True/False
    accordingly.
    """
    monkeypatch.setenv("LOOKERSDK_VERIFY_SSL", test_value)
    settings = api_settings.ApiSettings(
        filename=config_file, section="BARE_MINIMUM", env_prefix="LOOKERSDK"
    )
    assert settings.verify_ssl == expected


def test_configure_with_no_file(monkeypatch):
    """ApiSettings should be instantiated if required parameters all exist in env
    variables.
    """
    monkeypatch.setenv("LOOKERSDK_BASE_URL", "https://host1.looker.com:19999")
    monkeypatch.setenv("LOOKERSDK_CLIENT_ID", "id123")
    monkeypatch.setenv("LOOKERSDK_CLIENT_SECRET", "secret123")

    settings = api_settings.ApiSettings(
        filename="", env_prefix="LOOKERSDK",
    )  # explicitly setting config_file to falsey
    assert settings.base_url == "https://host1.looker.com:19999"
    data = vars(settings)
    assert "client_id" not in data
    assert "client_secret" not in data


@pytest.mark.parametrize(
    "test_section",
    [
        pytest.param("BARE", id="Empty config file"),
        pytest.param("BARE_MIN_NO_VALUES", id="Required settings are empty strings"),
    ],
)
def test_it_fails_if_required_settings_are_not_found(config_file, test_section):
    """ApiSettings should throw an error if required settings are not found."""
    with pytest.raises(error.SDKError):
        api_settings.ApiSettings(
            filename=config_file, section=test_section
        ).is_configured()


def test_it_fails_when_env_variables_are_defined_but_empty(config_file, monkeypatch):
    """ApiSettings should throw an error if required settings are passed as empty
    env variables.
    """
    monkeypatch.setenv("LOOKERSDK_BASE_URL", "")

    with pytest.raises(error.SDKError):
        api_settings.ApiSettings(
            filename=config_file, section="BARE", env_prefix="LOOKERSDK"
        ).is_configured()


def test_it_unquotes_quoted_config_file_vars(config_file):
    """ApiSettings should strip quotes from config file variables."""
    settings = api_settings.ApiSettings(
        filename=config_file, section="QUOTED_CONFIG_VARS"
    )
    assert settings.base_url == "https://host4.looker.com:19999"
    assert settings.verify_ssl is False


def test_it_unquotes_quoted_env_var_values(monkeypatch):
    """ApiSettings should strip quotes from env variable values."""
    monkeypatch.setenv("LOOKERSDK_BASE_URL", "'https://host1.looker.com:19999'")
    monkeypatch.setenv("LOOKERSDK_TIMEOUT", "100")
    monkeypatch.setenv("LOOKERSDK_VERIFY_SSL", '"false"')

    settings = api_settings.ApiSettings(
        env_prefix="LOOKERSDK"
    )  # _DEFAULT_INIS[0] absence doesn't raise

    assert settings.base_url == "https://host1.looker.com:19999"
    assert settings.verify_ssl is False
    assert settings.timeout == 100
