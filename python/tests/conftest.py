import os.path
import pytest  # type: ignore
import sys
import yaml
from typing import cast, Dict, List

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from looker_sdk import client  # noqa: E402
from looker_sdk import models as ml  # noqa: E402
from looker_sdk.sdk import methods as mtds  # noqa: E402


@pytest.fixture(scope="session")  # type: ignore
def looker_client():
    return client.setup("../looker.ini")


@pytest.fixture(scope="session", name="test_data")  # type: ignore
def get_test_data():
    with open("../test/data.yml") as f:
        test_data = yaml.safe_load(f)

    test_data["email_domain"] = "@testfoo.com"

    return test_data


@pytest.fixture(scope="session")  # type: ignore
def dashboards(test_data):
    return test_data["dashboards"]


@pytest.fixture(scope="session")  # type: ignore
def queries(test_data):
    return test_data["queries"]


@pytest.fixture(name="test_users")  # type: ignore
def create_test_users(looker_client: mtds.LookerSDK, test_data: Dict[str, str]):
    # Create some users
    users = cast(List[Dict[str, str]], test_data["users"])
    email_domain = test_data["email_domain"]
    user_ids: List[int] = []

    for u in users:
        user = looker_client.create_user(
            ml.WriteUser(first_name=u["first_name"], last_name=u["last_name"])
        )

        if user.id:
            user_ids.append(user.id)
            email = f"{u['first_name']}.{u['last_name']}{email_domain}"
            looker_client.create_user_credentials_email(
                user.id, ml.WriteCredentialsEmail(email=email)
            )

    yield

    # Clean up
    for user_id in user_ids:
        looker_client.delete_user(user_id)
