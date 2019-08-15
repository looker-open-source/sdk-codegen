import datetime
import pytest
from typing import MutableMapping, Optional

from looker_sdk.rtl import api_methods as am
from looker_sdk.rtl import requests_transport as rtp
from looker_sdk.rtl import serialize as sr
from looker_sdk.rtl import transport as tp
from looker_sdk.rtl import user_session as us
from looker_sdk.rtl import model
from looker_sdk.sdk import models as ml


@pytest.fixture(scope="module")
def api_methods() -> am.APIMethods:
    return am.APIMethods(
        us.UserSession, sr.deserialize, sr.serialize, rtp.RequestsTransport
    )


@pytest.mark.parametrize(
    "input, expected",
    [
        ({"a": None}, {}),
        ({"a": True}, {"a": "true"}),
        ({"a": "text"}, {"a": "text"}),
        ({"a": 1}, {"a": "1"}),
        ({"a": [1, 2, 3]}, {"a": "[1, 2, 3]"}),
        ({"a": ["x", "xy", "xyz"]}, {"a": '["x", "xy", "xyz"]'}),
        ({"a": datetime.datetime(2019, 8, 14, 8, 4, 2)}, {"a": "2019-08-14T08:04Z"}),
    ],
)
def test_convert_query_params(
    api_methods: am.APIMethods,
    input: am.TQueryParams,
    expected: MutableMapping[str, str],
):
    actual = api_methods._convert_query_params(input)
    assert actual == expected


@pytest.mark.parametrize(
    "input, expected",
    [
        ("some body text", b"some body text"),
        ("", b""),
        ({}, None),
        (ml.WriteApiSession(workspace_id="dev"), b'{"workspace_id": "dev"}'),
        (
            ml.ApiVersion(
                looker_release_version="6.18",
                current_version=ml.ApiVersionElement(
                    full_version="6.18.4", status="fully functional"
                ),
            ),
            b'{"looker_release_version": "6.18", "current_version": {"full_version": "6.18.4", "status": "fully functional"}}',  # noqa: B950
        ),
        (
            ml.ApiVersion(
                looker_release_version="6.18",
                current_version=ml.ApiVersionElement(
                    full_version="6.18.4", status="fully functional"
                ),
                supported_versions=model.EXPLICIT_NULL,
            ),
            b'{"looker_release_version": "6.18", "current_version": {"full_version": "6.18.4", "status": "fully functional"}, "supported_versions": null}',  # noqa: B950
        ),
    ],
)
def test_get_serialized(
    api_methods: am.APIMethods, input: am.TBody, expected: Optional[bytes]
):
    actual = api_methods._get_serialized(input)
    assert actual == expected


@pytest.mark.parametrize(
    "test_response, test_structure, expected",
    [
        (tp.Response(ok=True, value="some response text"), str, "some response text"),
        (tp.Response(ok=True, value=""), None, None),
        (
            tp.Response(
                ok=True,
                value='{"looker_release_version": "6.18", "current_version": {"version": null, "full_version": "6.18.4", "status": "fully functional", "swagger_url": null}, "supported_versions": null}',  # noqa: B950
            ),
            ml.ApiVersion,
            ml.ApiVersion(
                looker_release_version="6.18",
                current_version=ml.ApiVersionElement(
                    version=model.EXPLICIT_NULL,
                    full_version="6.18.4",
                    status="fully functional",
                    swagger_url=model.EXPLICIT_NULL,
                ),
                supported_versions=model.EXPLICIT_NULL,
            ),
        ),
        (
            tp.Response(ok=True, value='{"workspace_id": "dev"}'),
            ml.WriteApiSession,
            ml.WriteApiSession(workspace_id="dev"),
        ),
    ],
)
def test_return(
    api_methods: am.APIMethods,
    test_response: tp.Response,
    test_structure: am.TStructure,
    expected: am.TReturn,
):
    actual = api_methods._return(test_response, test_structure)
    assert actual == expected


def test_return_raises_an_APIError_for_bad_responses(api_methods):
    with pytest.raises(am.APIError) as exc:
        api_methods._return(tp.Response(ok=False, value="some error message"), str)
    assert "some error message" in str(exc.value)
