import datetime
from typing import Optional

from cryptography import fernet
import sendgrid  # type: ignore
from typing_extensions import Protocol

import sheets


class PCrypto(Protocol):
    def encrypt(self, value: str) -> str:
        """Encrypt a string.

        :param value: string value to encrypt
        :return: the encrypted string
        """
        ...

    def decrypt(self, value: str) -> str:
        """Decrypt a string.

        :param value: string value to decrypt
        :return: the decrypted string
        """
        ...


class Crypto:
    def __init__(self, key: str):
        self.cypher = fernet.Fernet(key.encode())

    def encrypt(self, value: str) -> str:
        return self.cypher.encrypt(value.encode()).decode()

    def decrypt(self, value: str) -> str:
        return self.cypher.decrypt(value.encode()).decode()


class PEmail(Protocol):
    def send(self, to_email: str, subject: str, body: str) -> None:
        ...


class Email:
    def __init__(self, from_email: str, api_key: str):
        self.client = sendgrid.SendGridAPIClient(api_key)
        self.from_email = from_email

    def send(self, to_email: str, subject: str, body: str) -> None:
        message = sendgrid.Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=subject,
            html_content=body,
        )
        self.client.send(message)


class Authentication:
    def __init__(self, *, crypto: PCrypto, sheet: sheets.Sheets, email: PEmail):
        self.crypto = crypto
        self.sheet = sheet
        self.email = email

    @classmethod
    def configure(
        cls, *, crypto_key: str, from_email: str, email_key: str, sheet: sheets.Sheets
    ) -> "Authentication":
        crypto = Crypto(crypto_key)
        email = Email(from_email, email_key)
        return cls(crypto=crypto, sheet=sheet, email=email)

    def auth_user(self, auth_code: str) -> Optional[sheets.User]:
        """Authenticate the user from the auth code

        :param value: string value of an auth code
        :return: a sheets.User or None if no corresponding user found
        """
        token = self.crypto.decrypt(auth_code)
        email = token.split("~")[0]
        return self.sheet.users.find(email)

    def send_auth_message(self, user: sheets.User, host_url: str) -> None:
        """Send the email authentication link to the user.
        """
        subject = "Welcome to the Looker Hackathon!"
        body = f"""<h1>Welcome to the Looker Hackathon!</h1>
Please click {host_url}auth/{self.get_user_auth_code(user)} to authenticate your email so you can use the Hackathon application
and participate in the Hackathon
"""
        self.email.send(user.email, subject, body)

    def get_user_auth_code(self, user: sheets.User) -> str:
        token = f"{user.email}~{datetime.datetime.now(tz=datetime.timezone.utc)}"
        return self.crypto.encrypt(token)
