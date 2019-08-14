import os.path
import pytest
import sys
import yaml
from typing import cast, Dict, List, Union

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from looker.sdk import methods as mtds  # noqa: E402
from looker.sdk import models as ml  # noqa: E402


@pytest.fixture(scope="session")
def client() -> mtds.LookerSDK:
    client = mtds.LookerSDK.configure("../looker.ini")
    return client


@pytest.fixture(name="test_data")
def get_test_data() -> Dict[str, Union[List[Dict[str, str]], str]]:
    with open("../test/data.yml") as f:
        test_data: Dict[str, Union[str, List[Dict[str, str]]]] = yaml.safe_load(f)

    return {"users": test_data["users"], "email_domain": "@testfoo.com"}


@pytest.fixture()
def create_users(
    client: mtds.LookerSDK, test_data: Dict[str, Union[List[Dict[str, str]], str]]
) -> None:
    # Create some users
    users = cast(List[Dict[str, str]], test_data["users"])
    email_domain = test_data["email_domain"]
    user_ids: List[int] = []

    for u in users:
        user = client.create_user(
            ml.WriteUser(first_name=u["first_name"], last_name=u["last_name"])
        )

        if user.id:
            user_ids.append(user.id)
            email = f"{u['first_name']}.{u['last_name']}{email_domain}"
            client.create_user_credentials_email(
                user.id, ml.WriteCredentialsEmail(email=email)
            )

    yield

    # Clean up
    for user_id in user_ids:
        client.delete_user(user_id)
