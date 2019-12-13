import os.path
import pytest  # type: ignore
import sys
import yaml
from typing import cast, Dict, List, Union

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from looker_sdk import client  # noqa: E402
from looker_sdk import models as ml  # noqa: E402
from looker_sdk.sdk import methods as mtds  # noqa: E402


@pytest.fixture(scope="session")
def dashboards(_test_data):
    return _test_data["dashboards"]


@pytest.fixture(scope="session")
def looks(_test_data):
    return _test_data["looks"]


@pytest.fixture(scope="session")
def queries(_test_data) -> List[Dict[str, str]]:
    return _test_data["queries"]


@pytest.fixture(scope="session")
def users(_test_data) -> List[Dict[str, str]]:
    return _test_data["users"]


@pytest.fixture(scope="session")
def email_domain(_test_data) -> str:
    return _test_data["email_domain"]


TTestData = Dict[str, Union[str, List[Dict[str, str]]]]


@pytest.fixture(scope="session", name="_test_data")
def _get_test_data() -> TTestData:
    with open("../test/data.yml") as f:
        test_data = cast(TTestData, yaml.safe_load(f))
    test_data["email_domain"] = "@testfoo.com"
    return test_data


@pytest.fixture(scope="function")
def remove_test_dashboards(sdk: mtds.LookerSDK, dashboards):
    # Clean up any test dashboards that may exist. We do this at the beginning
    # instead of the end of tests in case we want to view the dashboards after the test
    for d in dashboards:
        search_results = sdk.search_dashboards(title=d["title"])
        if len(search_results) > 0:
            for dashboard in search_results:
                sdk.delete_dashboard(cast(str, dashboard.id))


@pytest.fixture(scope="function")
def remove_test_looks(sdk: mtds.LookerSDK, looks):
    for l in looks:
        search_results = sdk.search_looks(title=l["title"])
        if len(search_results) > 0:
            for look in search_results:
                sdk.delete_look(cast(int, look.id))


@pytest.fixture(name="test_users", scope="session")
def create_test_users(
    sdk: mtds.LookerSDK, users: List[Dict[str, str]], email_domain: str
):
    user_ids: List[int] = []

    for u in users:
        user = sdk.create_user(
            ml.WriteUser(first_name=u["first_name"], last_name=u["last_name"])
        )

        if user.id:
            user_ids.append(user.id)
            email = f"{u['first_name']}.{u['last_name']}{email_domain}"
            sdk.create_user_credentials_email(
                user.id, ml.WriteCredentialsEmail(email=email)
            )

    yield

    for user_id in user_ids:
        sdk.delete_user(user_id)


@pytest.fixture(scope="session")
def sdk():
    sdk = client.setup("../looker.ini")
    yield sdk
    sdk.logout()
