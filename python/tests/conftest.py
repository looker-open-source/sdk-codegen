import os.path
import pytest
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from looker.sdk import methods  # noqa: E402


def pytest_addoption(parser):
    parser.addoption(
        "--live",
        action="store_true",
        help="Run tests against a live Looker instance. This "
        "requires a valid configuration file.",
    )


@pytest.fixture(scope="session")
def client(pytestconfig) -> methods.LookerSDK:
    if pytestconfig.getoption("live"):
        client = methods.LookerSDK.configure("../looker.ini")
    else:
        # TODO: logic for using a mock-requests class
        pass
    return client
