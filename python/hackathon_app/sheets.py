from typing import Dict, Generic, List, Optional, Union, Sequence, Type, TypeVar
import datetime
import itertools
import re

import attr
import cattr
from google.oauth2 import service_account  # type: ignore
import googleapiclient.errors  # type: ignore
import googleapiclient.discovery  # type: ignore

NIL = "\x00"

DATE_FORMAT = "%m/%d/%Y"


@attr.s(auto_attribs=True, kw_only=True)
class RegisterUser:
    hackathon: str
    first_name: str
    last_name: str
    email: str
    organization: str
    role: str
    tshirt_size: str = ""


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
        return self.hackathons.get_upcoming()

    def register_user(self, register_user: RegisterUser):
        """Register user to a hackathon"""
        user = self.users.find(register_user.email) or User()
        user.first_name = register_user.first_name
        user.last_name = register_user.last_name
        user.email = register_user.email
        user.organization = register_user.organization
        user.role = register_user.role
        user.tshirt_size = register_user.tshirt_size
        self.users.save(user)
        registrant = Registrant(
            user_email=user.email, hackathon_name=register_user.hackathon
        )
        if not self.registrations.is_registered(registrant):
            self.registrations.register(registrant)

        return user


@attr.s(auto_attribs=True, kw_only=True)
class Model:
    id: Optional[int] = None


TModel = TypeVar("TModel", bound=Model)


converter = cattr.Converter()


class WhollySheet(Generic[TModel]):
    def __init__(
        self,
        *,
        client,
        spreadsheet_id: str,
        sheet_name: str,
        structure: Type[TModel],
        key: str,
        converter=converter,
    ):
        self.client = client
        self.spreadsheet_id = spreadsheet_id
        self.sheet_name = sheet_name
        self.range = f"{sheet_name}!A1:end"
        self.structure = structure
        self.key = key
        self.converter = converter

    def save(self, model: TModel):
        if model.id:
            self.update(model)
        else:
            self.insert(model)

    def insert(self, model: TModel):
        """Insert data as rows into sheet"""
        try:
            serialized_ = self.converter.unstructure(model)
            serialized = self._convert_to_list(serialized_)
            body = {"values": [serialized]}
            response = self.client.append(
                spreadsheetId=self.spreadsheet_id,
                range=self.range,
                insertDataOption="INSERT_ROWS",
                valueInputOption="RAW",
                body=body,
            ).execute()
        except (TypeError, AttributeError):
            raise SheetError("Could not insert row")

        # something like "users!A6:F6"
        updated_range = response["updates"]["updatedRange"]
        match = re.match(fr"{self.sheet_name}!A(?P<row_id>\d+)", updated_range)
        if not match:
            raise SheetError("Could not determine row_id")
        model.id = int(match.group("row_id"))

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

    def update(self, model: TModel):
        """Update user"""
        try:
            serialized_ = self.converter.unstructure(model)
            serialized = self._convert_to_list(serialized_)
            body = {"values": [serialized]}
            self.client.update(
                spreadsheetId=self.spreadsheet_id,
                range=f"{self.sheet_name}!A{model.id}:end",
                valueInputOption="RAW",
                body=body,
            ).execute()
        except (TypeError, AttributeError):
            raise SheetError("Could not update row")

    def find(
        self,
        value: Union[str, bool, int, datetime.datetime, None],
        *,
        key: Optional[str] = None,
    ) -> Optional[TModel]:
        key = key if key else self.key
        ret = None
        for row in self.rows():
            if getattr(row, key) == value:
                ret = row
                break
        return ret

    def _convert_to_dict(self, data) -> List[Dict[str, str]]:
        """Given a list of lists where the first list contains key names, convert it to
        a list of dictionaries.
        """
        header = data[0]
        header.insert(0, "id")
        result: List[Dict[str, str]] = []
        # Google Sheets are 1 indexed, with the first row being the header.
        header_offset = 2
        for index, row in enumerate(data[1:]):
            row.insert(0, index + header_offset)  # id value
            row_tuples = itertools.zip_longest(header, row, fillvalue="")
            result.append(dict(row_tuples))
        return result

    def _convert_to_list(
        self, data: Dict[str, Union[str, int]]
    ) -> Sequence[Union[str, int]]:
        """Given a dictionary, return a list containing its values. The 'id' key is dropped
        since it's not part of the schema
        """
        data.pop("id")
        return list(data.values())


@attr.s(auto_attribs=True, kw_only=True)
class User(Model):
    first_name: str = ""
    last_name: str = ""
    email: str = ""
    date_created: datetime.datetime = attr.ib(
        default=attr.Factory(lambda: datetime.datetime.now(tz=datetime.timezone.utc))
    )
    organization: str = ""
    role: str = ""
    tshirt_size: str = ""
    client_id: str = ""
    client_secret: str = ""
    setup_link: str = ""


class Users(WhollySheet[User]):
    def __init__(self, *, client, spreadsheet_id: str):
        super().__init__(
            client=client,
            spreadsheet_id=spreadsheet_id,
            sheet_name="users",
            structure=User,
            key="email",
        )


@attr.s(auto_attribs=True, kw_only=True)
class Hackathon(Model):
    name: str
    label: str
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
            key="name",
        )

    def get_upcoming(
        self, *, cutoff: Optional[datetime.datetime] = None
    ) -> Sequence[Hackathon]:
        now = datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(
            days=1
        )
        ret = []
        for hackathon in self.rows():
            if hackathon.date < now:
                continue
            if cutoff and hackathon.date > cutoff:
                continue
            ret.append(hackathon)
        return ret


@attr.s(auto_attribs=True, kw_only=True)
class Registrant(Model):
    user_email: str
    hackathon_name: str
    date_registered: Optional[datetime.datetime] = None
    attended: Optional[bool] = None


class Registrations(WhollySheet[Registrant]):
    def __init__(self, *, client, spreadsheet_id: str):
        super().__init__(
            client=client,
            spreadsheet_id=spreadsheet_id,
            sheet_name="registrations",
            structure=Registrant,
            key="hackathon_name",
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
        registrant.date_registered = datetime.datetime.now(tz=datetime.timezone.utc)
        super().insert(registrant)


class SheetError(Exception):
    """Improperly formatted data to deserialize"""


converter.register_structure_hook(
    datetime.datetime, lambda d, _: datetime.datetime.fromisoformat(d)  # type: ignore
)
converter.register_unstructure_hook(
    datetime.datetime, lambda d: d.isoformat()  # type: ignore
)


def _convert_bool(val: str, _: bool) -> Optional[bool]:
    converted: Optional[bool]
    if val.lower() in ("yes", "y", "true", "t", "1"):
        converted = True
    elif val.lower() in ("", "no", "n", "false", "f", "0", "null", "na"):
        converted = False
    elif val.lower() == NIL:
        converted = None
    else:
        raise TypeError(f"Failed to convert '{val}' to bool")
    return converted


converter.register_unstructure_hook(type(None), lambda t: NIL)
converter.register_structure_hook(bool, _convert_bool)


if __name__ == "__main__":
    sheets = Sheets(spreadsheet_id="SHEET_ID", cred_file="CREDS_FILE")
