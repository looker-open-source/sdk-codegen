from typing import cast, Dict, Generic, List, Optional, Union, Sequence, Type, TypeVar
import datetime
import itertools

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
            if hackathon.date >= datetime.date.today():
                result.append(hackathon)
        return result

    def register_user(self, *, hackathon: str, user: "User"):
        """Register user to a hackathon"""
        if self.users.find(user.email):
            self.users.update(user)
        else:
            self.users.create(user)
        registrant = Registrant(
            user_email=user.email,
            hackathon_name=hackathon,
            date_registered=datetime.date.today(),
            attended=None,
        )
        if not self.registrations.is_registered(registrant):
            self.registrations.register(registrant)


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
        immutable_fields: Optional[List[str]] = None,
    ):
        self.client = client
        self.spreadsheet_id = spreadsheet_id
        self.sheet_name = sheet_name
        self.range = f"{sheet_name}!A1:end"
        self.structure = structure
        self.key = key
        self.converter = converter
        self.immutable_fields = ["id"]
        if immutable_fields:
            self.immutable_fields.extend(immutable_fields)

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
        id_in_range_offset = len(f"{self.sheet_name}!A")
        model.id = int(updated_range[id_in_range_offset])

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
        ex_model = self.find(getattr(model, self.key))
        if not ex_model:
            raise SheetError("No entry found.")
        for field in self.immutable_fields:
            setattr(model, field, getattr(ex_model, field))
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
    first_name: str
    last_name: str
    email: str
    date_created: Optional[datetime.date] = None
    organization: str
    tshirt_size: str


class Users(WhollySheet[User]):
    def __init__(self, *, client, spreadsheet_id: str):
        super().__init__(
            client=client,
            spreadsheet_id=spreadsheet_id,
            sheet_name="users",
            structure=User,
            key="email",
            immutable_fields=["date_created"],
        )

    def create(self, user: User):
        """Insert user details in the users sheet"""
        user.date_created = datetime.date.today()
        super().insert(user)


@attr.s(auto_attribs=True, kw_only=True)
class Hackathon(Model):
    name: str
    location: str
    date: datetime.date
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


@attr.s(auto_attribs=True, kw_only=True)
class Registrant(Model):
    user_email: str
    hackathon_name: str
    date_registered: datetime.date
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
        super().insert(registrant)


class SheetError(Exception):
    """Improperly formatted data to deserialize"""


converter.register_structure_hook(
    datetime.date,
    lambda d, _: datetime.datetime.strptime(  # type: ignore
        d, DATE_FORMAT
    ).date(),
)
converter.register_unstructure_hook(
    datetime.date,
    lambda d: datetime.date.strftime(  # type: ignore
        d, DATE_FORMAT
    ),
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
