from typing import (
    cast,
    Dict,
    Generic,
    Mapping,
    Optional,
    Union,
    Sequence,
    Type,
    TypeVar,
)
import datetime

import attr
import cattr
from google.oauth2 import service_account  # type: ignore
import googleapiclient.errors  # type: ignore
import googleapiclient.discovery  # type: ignore

NIL = "\x00"

DATE_FORMAT = "%m/%d/%Y"


class Sheets:
    """An API for manipulating the Google Sheet containing hackathon data."""

    def __init__(self, *, spreadsheet_id: str, cred_file: str):
        scopes = [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/spreadsheets",
        ]

        credentials = service_account.Credentials.from_service_account_file(
            cred_file, scopes=scopes
        )

        service = googleapiclient.discovery.build(
            "sheets", "v4", credentials=credentials, cache_discovery=False
        )
        client = service.spreadsheets().values()
        self.id = spreadsheet_id
        self.hackathons = Hackathons(client=client, spreadsheet_id=spreadsheet_id)
        self.registrations = Registrations(client=client, spreadsheet_id=spreadsheet_id)
        self.users = Users(client=client, spreadsheet_id=spreadsheet_id)

    def get_hackathons(self) -> Sequence["Hackathon"]:
        """Get names of active hackathons."""
        hackathons = cast(Sequence["Hackathon"], self.hackathons.rows())
        result = []
        for hackathon in hackathons:
            if hackathon.date >= datetime.datetime.now():
                result.append(hackathon)
        return result

    def register_user(self, *, hackathon: str, user: "User"):
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


TModel = TypeVar("TModel")


converter = cattr.Converter()


class WhollySheet(Generic[TModel]):
    def __init__(
        self,
        *,
        client,
        spreadsheet_id: str,
        sheet_name: str,
        structure: Type[TModel],
        converter=converter,
    ):
        self.client = client
        self.spreadsheet_id = spreadsheet_id
        self.range = f"{sheet_name}!A1:end"
        self.structure = structure
        self.converter = converter

    def insert(self, model: TModel):
        """Insert data as rows into sheet"""
        try:
            serialized_ = self.converter.unstructure(model)
            serialized = self._convert_to_list(serialized_)
            body = {"values": [serialized]}
            self.client.append(
                spreadsheetId=self.spreadsheet_id,
                range=self.range,
                insertDataOption="INSERT_ROWS",
                valueInputOption="RAW",
                body=body,
            ).execute()
        except (TypeError, AttributeError):
            raise SheetError("Could not insert row")

    def rows(self) -> Sequence[TModel]:
        """Retrieve rows from sheet"""
        try:
            response = self.client.get(
                spreadsheetId=self.spreadsheet_id, range=self.range
            ).execute()
        except googleapiclient.errors.HttpError as ex:
            raise SheetError(str(ex))
        try:
            rows = response["values"]
            data = self._convert_to_dict(rows)
            # ignoring type (mypy bug?) "Name 'self.structure' is not defined"
            response = self.converter.structure(
                data, Sequence[self.structure]  # type: ignore
            )
        except (TypeError, AttributeError) as ex:
            raise SheetError(str(ex))
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
    date_created: Optional[datetime.datetime] = None
    organization: str
    tshirt_size: str


class Users(WhollySheet[User]):
    def __init__(self, *, client, spreadsheet_id: str):
        super().__init__(
            client=client,
            spreadsheet_id=spreadsheet_id,
            sheet_name="users",
            structure=User,
        )

    def is_created(self, user: User) -> bool:
        """Checks if user already exists in users sheet"""
        users = super().rows()
        found = False
        for u in users:
            if u.email == user.email:
                found = True
        return found

    def create(self, user: User):
        """Insert user details in the users sheet"""
        user.date_created = datetime.datetime.now()
        super().insert(user)


@attr.s(auto_attribs=True, kw_only=True)
class Hackathon:
    name: str
    location: str
    date: datetime.datetime
    duration_in_days: int


class Hackathons(WhollySheet[Hackathon]):
    def __init__(self, *, client, spreadsheet_id: str):
        super().__init__(
            client=client,
            spreadsheet_id=spreadsheet_id,
            sheet_name="hackathons",
            structure=Hackathon,
        )


@attr.s(auto_attribs=True, kw_only=True)
class Registrant:
    user_email: str
    hackathon_name: str
    date_registered: datetime.datetime
    attended: Optional[bool] = None


class Registrations(WhollySheet[Registrant]):
    def __init__(self, *, client, spreadsheet_id: str):
        super().__init__(
            client=client,
            spreadsheet_id=spreadsheet_id,
            sheet_name="registrations",
            structure=Registrant,
        )

    def is_registered(self, registrant: Registrant) -> bool:
        """Check if registrant is already registerd"""
        registrants = super().rows()
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


class SheetError(Exception):
    """Improperly formatted data to deserialize"""


converter.register_structure_hook(
    datetime.datetime,
    lambda d, _: datetime.datetime.strptime(  # type: ignore
        d, DATE_FORMAT
    ),
)
converter.register_unstructure_hook(
    datetime.datetime,
    lambda d: datetime.datetime.strftime(  # type: ignore
        d, DATE_FORMAT
    ),
)


def _convert_bool(val: str, _: bool) -> Optional[bool]:
    converted: Optional[bool]
    if val.lower() in ("yes", "y", "true", "t", "1"):
        converted = True
    elif val.lower() in ("", "no", "n", "false", "f", "0"):
        converted = False
    elif val.lower() == NIL:
        converted = None
    else:
        raise TypeError
    return converted


converter.register_unstructure_hook(type(None), lambda t: NIL)
converter.register_structure_hook(bool, _convert_bool)


if __name__ == "__main__":
    sheets = Sheets(spreadsheet_id="SHEET_ID", cred_file="CREDS_FILE")
