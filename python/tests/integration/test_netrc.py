import os
import pytest  # type: ignore
from urllib.parse import urlparse

from looker_sdk.sdk.api40 import methods as mtds
from looker_sdk.sdk.api40 import models as ml

NETRC_LOCATION = os.path.expanduser("~/.netrc")


@pytest.fixture()
def sdk(sdk40) -> mtds.Looker40SDK:
    return sdk40


def can_create_netrc_file():
    """Check if netrc can be created in home directory."""
    can = False
    if NETRC_LOCATION.startswith("~") or os.path.exists(NETRC_LOCATION):
        can = False
    else:
        can = True
    return can


@pytest.fixture()
def create_netrc_file(sdk: mtds.Looker40SDK):
    """Create a sample netrc meant to cause conflicts with the looker.ini file"""
    host = urlparse(sdk.auth.settings.base_url).netloc.split(":")[0]
    netrc_contents = (
        f"machine {host}"
        f"\n  login netrc_client_id"
        f"\n  password netrc_client_secret"
    )

    with open(NETRC_LOCATION, "w") as netrc_file:
        netrc_file.write(netrc_contents)

    yield

    os.remove(NETRC_LOCATION)


@pytest.mark.skipif(
    not can_create_netrc_file(),
    reason="netrc file cannot be created because it already exists or $HOME is undefined",  # noqa: B950
)
@pytest.mark.usefixtures("create_netrc_file")
def test_netrc_does_not_override_ini_creds(sdk: mtds.Looker40SDK):
    """The requests library overrides HTTP authorization headers if the auth= parameter
    is not specified, resulting in an authentication error. This test makes sure this
    does not happen when netrc files are found on the system.
    """
    me = sdk.me()
    assert isinstance(me, ml.User)
