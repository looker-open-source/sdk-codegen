import datetime
import pytest  # type: ignore


from sheets import WhollySheet, DATE_FORMAT


def test_convert_to_list_returns_list(WhollySheet: WhollySheet):
    """_convert_to_list() should convert a dict into a list"""
    data = {
        "id": 5,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@foo.com",
        "created_date": datetime.date.strftime(datetime.date.today(), DATE_FORMAT),
        "organization": "foo",
        "tshirt_size": "S",
    }
    result = WhollySheet._convert_to_list(data)
    assert isinstance(result, list)
    assert result == [
        "John",
        "Doe",
        "john@foo.com",
        datetime.date.strftime(datetime.date.today(), DATE_FORMAT),
        "foo",
        "S",
    ]


@pytest.mark.parametrize(
    "test_input, expected_output",
    [
        (
            [
                ["user_email", "hackathon_name", "date_registered", "attended"],
                ["jane@bar.com", "london2019", "6/10/2019", "True"],
                ["john@foo.com", "london2019", "6/11/2019", "False"],
            ],
            [
                {
                    "id": 2,
                    "user_email": "jane@bar.com",
                    "hackathon_name": "london2019",
                    "date_registered": "6/10/2019",
                    "attended": "True",
                },
                {
                    "id": 3,
                    "user_email": "john@foo.com",
                    "hackathon_name": "london2019",
                    "date_registered": "6/11/2019",
                    "attended": "False",
                },
            ],
        )
    ],
)
def test_convert_to_dict_returns_dict(
    WhollySheet: WhollySheet, test_input, expected_output
):
    """_convert_to_dict() should convert a list of lists into a dictionary"""
    result = WhollySheet._convert_to_dict(test_input)
    assert result == expected_output
