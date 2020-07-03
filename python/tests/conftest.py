import os.path
import sys
from typing import Dict, List, Union, cast

import pytest  # type: ignore
import yaml

import looker_sdk  # noqa: E402
from looker_sdk.sdk.api40 import methods as methods40
from looker_sdk.sdk.api40 import models as models40  # noqa: E402

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


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
def queries_system_activity(_test_data) -> List[Dict[str, str]]:
    return _test_data["queries_system_activity"]


@pytest.fixture(scope="session")
def users(_test_data) -> List[Dict[str, str]]:
    return _test_data["users"]


@pytest.fixture(scope="session")
def email_domain(_test_data) -> str:
    return _test_data["email_domain"]


@pytest.fixture(scope="session")
def string_content_types(_test_data) -> List[str]:
    return _test_data["content_types"]["string"]


@pytest.fixture(scope="session")
def binary_content_types(_test_data) -> List[str]:
    return _test_data["content_types"]["binary"]


TTestData = Dict[str, Union[str, List[Dict[str, str]]]]


@pytest.fixture(scope="session", name="_test_data")
def _get_test_data() -> TTestData:
    with open("../test/data.yml") as f:
        test_data = cast(TTestData, yaml.safe_load(f))
    test_data["email_domain"] = "@testfoo.com"
    return test_data


@pytest.fixture(scope="function")
def remove_test_dashboards(sdk40: methods40.Looker40SDK, dashboards):
    # Clean up any test dashboards that may exist. We do this at the beginning
    # instead of the end of tests in case we want to view the dashboards after the test
    for d in dashboards:
        search_results = sdk40.search_dashboards(title=d["title"])
        if len(search_results) > 0:
            for dashboard in search_results:
                sdk40.delete_dashboard(cast(str, dashboard.id))


@pytest.fixture(scope="function")
def remove_test_looks(sdk40: methods40.Looker40SDK, looks):
    for l in looks:
        search_results = sdk40.search_looks(title=l["title"])
        if len(search_results) > 0:
            for look in search_results:
                sdk40.delete_look(cast(int, look.id))


@pytest.fixture(name="test_users", scope="session")
def create_test_users(
    sdk40: methods40.Looker40SDK, users: List[Dict[str, str]], email_domain: str
):
    user_ids: List[int] = []
    for u in users:
        # TODO: if the test crashes it doesn't clean up the users.
        user = sdk40.create_user(
            models40.WriteUser(first_name=u["first_name"], last_name=u["last_name"])
        )

        if user.id:
            user_ids.append(user.id)
            email = f"{u['first_name']}.{u['last_name']}{email_domain}"
            sdk40.create_user_credentials_email(
                user.id, models40.WriteCredentialsEmail(email=email)
            )

    yield

    for user_id in user_ids:
        sdk40.delete_user(user_id)


@pytest.fixture(scope="session")
def sdk31(init_sdk):
    sdk = init_sdk(3.1)
    yield sdk
    sdk.logout()


@pytest.fixture(scope="session")
def sdk40(init_sdk):
    sdk = init_sdk(4.0)
    yield sdk
    sdk.logout()


@pytest.fixture(scope="session")
def init_sdk():
    def _sdk(api_version):
        filename = os.getenv("LOOKERSDK_INI", "../looker.ini")
        if api_version == 4.0:
            sdk = looker_sdk.init40(filename)
        elif api_version == 3.1:
            sdk = looker_sdk.init31(filename)
        return sdk

    return _sdk
