from google.oauth2 import service_account  # type: ignore
from googleapiclient import discovery  # type: ignore

from typing import cast, Dict, Mapping, Optional, Union, Sequence

import attr
import cattr
import datetime

# TODO: add error handling. Isolate it around unstructure and the client


class Sheets:
    """An API for manipulating the Google Sheet containing hackathon data."""

    def __init__(self, spreadsheet_id: str, cred_file: str):
        scopes = [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/spreadsheets",
        ]

        credentials = service_account.Credentials.from_service_account_file(
            cred_file, scopes=scopes
        )

        service = discovery.build("sheets", "v4", credentials=credentials)
        client = service.spreadsheets().values()
        self.id = spreadsheet_id
        self.hackathons = Hackathons(client, spreadsheet_id)
        self.registrations = Registrations(client, spreadsheet_id)
        self.users = Users(client, spreadsheet_id)

    def get_hackathons(self) -> Sequence["Hackathon"]:
        """Get names of active hackathons."""
        hackathons = cast(Sequence["Hackathon"], self.hackathons.rows())
        result = []
        for hackathon in hackathons:
            if hackathon.date >= datetime.datetime.now():
                result.append(hackathon)
        return result

    def register_user(self, hackathon: str, user: "User"):
        """Register user to a hackathon"""
        if not self.users.is_created(user):
            self.users.create(user)
        registrant = Registrant(
            user_email=user.email,
            hackathon_name=hackathon,
            date_registered=datetime.datetime.now(),
            attended=None,
        )
        if not self.registrations.is_registered(registrant):
            self.registrations.register(registrant)


TStructure = Union[Sequence["Hackathon"], Sequence["User"], Sequence["Registrant"]]


class WhollySheet:
    def __init__(self, client, spreadsheet_id: str, sheet_name: str, structure):
        self.client = client
        self.spreadsheet_id = spreadsheet_id
        self.range = f"{sheet_name}!A1:end"
        self.structure = structure

    def insert(self, data):
        """Insert data as rows into sheet"""
        try:
            serialized_ = cattr.unstructure(data)
            serialized = self._convert_to_list(serialized_)
            body = {"values": [serialized]}
            self.client.append(
                spreadsheetId=self.spreadsheet_id,
                range=self.range,
                insertDataOption="INSERT_ROWS",
                valueInputOption="RAW",
                body=body,
            ).execute()
        except:
            print("Oops. No go.")

    def rows(self) -> TStructure:
        """Retrieve rows from sheet"""
        try:
            response = self.client.get(
                spreadsheetId=self.spreadsheet_id, range=self.range
            ).execute()
            rows = response["values"]
            data = self._convert_to_dict(rows)
            response = cattr.structure(data, self.structure)
        except (TypeError, AttributeError):
            raise DeserializeError("Bad Data")
        return response

    def _convert_to_dict(self, data) -> Sequence[Mapping[str, str]]:
        """Given a list of lists where the first list contains key names, convert it to
        a list of dictionaries.
        """
        result: Sequence[Dict[str, str]] = [dict(zip(data[0], r)) for r in data[1:]]
        return result

    def _convert_to_list(
        self,
        data: Mapping[str, Union[str, int, Sequence[str], datetime.datetime, None]],
    ) -> Sequence:
        """Given a dictionary, return a list containing its values"""
        return list(data.values())


@attr.s(auto_attribs=True, kw_only=True)
class User:
    first_name: str
    last_name: str
    email: str
    date_created: Optional[datetime.datetime]
    organization: str
    tshirt_size: str


class Users(WhollySheet):
    def __init__(self, client, spreadsheet_id):
        super().__init__(client, spreadsheet_id, "users", Sequence[User])

    def is_created(self, user: User) -> bool:
        """Checks if user already exists in users sheet"""
        users = super().rows()
        found = False
        for u in users:
            if u == user:
                found = True
        return found

    def create(self, user: User):
        """Insert user details in the users sheet"""
        super().insert(user)


@attr.s(auto_attribs=True, kw_only=True)
class Hackathon:
    name: str
    location: str
    date: datetime.datetime
    duration_in_days: int


class Hackathons(WhollySheet):
    def __init__(self, client, spreadsheet_id):
        super().__init__(client, spreadsheet_id, "hackathons", Sequence[Hackathon])


@attr.s(auto_attribs=True, kw_only=True)
class Registrant:
    user_email: str
    hackathon_name: str
    date_registered: datetime.datetime
    attended: Optional[bool]


class Registrations(WhollySheet):
    def __init__(self, client, spreadsheet_id):
        super().__init__(client, spreadsheet_id, "registrations", Sequence[Registrant])

    def is_registered(self, registrant: Registrant) -> bool:
        """Check if registrant is already registerd"""
        registrants = cast(Sequence[Registrant], super().rows())
        registered = False
        for r in registrants:
            if (
                r.user_email == registrant.user_email
                and r.hackathon_name == registrant.hackathon_name
            ):
                registered = True
        return registered

    def register(self, registrant: Registrant):
        """Register user by inserting registrant details into registrations sheet"""
        super().insert(registrant)


class DeserializeError(Exception):
    """Improperly formatted data to deserialize"""


cattr.register_structure_hook(
    datetime.datetime,
    lambda d, _: datetime.datetime.strptime(  # type: ignore
        d, "%m/%d/%Y"
    ),
)
cattr.register_unstructure_hook(
    datetime.datetime,
    lambda d: datetime.datetime.strftime(  # type: ignore
        d, "%m/%d/%Y"
    ),
)
cattr.register_unstructure_hook(type(None), lambda s: "NA")

if __name__ == "__main__":
    sheets = Sheets("SHEET_ID", "CREDS_FILE")
