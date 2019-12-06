import os
from typing import List

from cryptography import fernet
import pytest  # type: ignore

import authentication
from sheets import Sheets, User


class NoopCrypto:
    def encrypt(self, value: str) -> str:
        return value

    def decrypt(self, value: str) -> str:
        return value


class NoopEmail:
    def send(self, to_email: str, subject: str, body: str) -> None:
        pass


def test_send_email():
    to_email = os.environ.get("TEST_TO_EMAIL")
    from_email = os.environ.get("FROM_EMAIL")
    api_key = os.environ.get("SENDGRID_API_KEY")
    if not (to_email and from_email and api_key):
        pytest.fail("Missing environment variables")

    emailer = authentication.Email(from_email, api_key)
    emailer.send(to_email, "hackathon app test", "this is a body")


def test_encrypt_decrypt():
    crypto = authentication.Crypto(fernet.Fernet.generate_key().decode())
    value = "foobar"
    encrypted = crypto.encrypt(value)
    assert encrypted != value
    decrypted = crypto.decrypt(encrypted)
    assert decrypted == value


def test_get_user_auth_code(sheets: Sheets):
    user = User(
        first_name="Hundy",
        last_name="P",
        email="hundyp@company.com",
        organization="company",
        role="BI analyst",
        tshirt_size="M",
    )

    auth_service = authentication.Authentication(
        crypto=NoopCrypto(), sheet=sheets, email=NoopEmail()
    )
    auth_code = auth_service.get_user_auth_code(user)
    email, date = auth_code.split("~")
    assert email == "hundyp@company.com"


def test_auth_user(sheets: Sheets, test_users: List[User]):
    auth_service = authentication.Authentication(
        crypto=NoopCrypto(), sheet=sheets, email=NoopEmail()
    )
    user = test_users[0]
    auth_code = auth_service.get_user_auth_code(user)
    authenticated_user = auth_service.auth_user(auth_code)
    assert authenticated_user == user


def test_send_auth_message(sheets: Sheets, test_users: List[User]):
    user = test_users[0]

    class FooCrypto:
        def encrypt(self, value: str) -> str:
            return "foo"

        def decrypt(self, value: str) -> str:
            return "foo"

    class TestEmail:
        def __init__(self, to_email):
            self.to_email = user.email

        def send(self, to_email: str, subject: str, body: str) -> None:
            assert to_email == self.to_email
            assert subject == "Welcome to the Looker Hackathon!"
            assert (
                body
                == f"""<h1>Welcome to the Looker Hackathon!</h1>
Please click https://foo.com/auth/foo to authenticate your email so you can use the Hackathon application
and participate in the Hackathon
"""
            )

    auth_service = authentication.Authentication(
        crypto=FooCrypto(), sheet=sheets, email=TestEmail(user.email)
    )
    auth_service.send_auth_message(user, "https://foo.com/")
