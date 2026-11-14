# The MIT License (MIT)
#
# Copyright (c) 2019 Looker Data Sciences, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

import datetime
import json
from typing import MutableMapping, Optional, Union

import pytest  # type: ignore

from looker_sdk import error
from looker_sdk.rtl import auth_session
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import api_methods
from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import serialize
from looker_sdk.rtl import transport
from looker_sdk.sdk import constants
from looker_sdk.sdk.api40 import models


@pytest.fixture(scope="module")
def api() -> api_methods.APIMethods:
    settings = api_settings.ApiSettings(
        filename="../looker.ini", env_prefix=constants.environment_prefix
    )
    transport = requests_transport.RequestsTransport.configure(settings)
    auth = auth_session.AuthSession(settings, transport, serialize.deserialize40, "4.0")
    return api_methods.APIMethods(
        auth, serialize.deserialize40, serialize.serialize40, transport, "4.0"
    )


@pytest.mark.parametrize(
    "test_query_params, expected",
    [
        ({"a": None}, {}),
        ({"a": True}, {"a": "true"}),
        ({"a": "text"}, {"a": "text"}),
        ({"a": 1}, {"a": "1"}),
        ({"a": [1, 2, 3]}, {"a": "[1, 2, 3]"}),
        ({"a": models.DelimSequence([1, 2, 3])}, {"a": "1,2,3"}),
        ({"a": models.DelimSequence(["a", "b", "c"])}, {"a": "a,b,c"}),
        (
            {
                "a": models.DelimSequence(
                    ["a", "b", "c"], prefix="<", suffix=">", separator="|"
                )
            },
            {"a": "<a|b|c>"},
        ),
        ({"a": ["x", "xy", "xyz"]}, {"a": '["x", "xy", "xyz"]'}),
        ({"a": datetime.datetime(2019, 8, 14, 8, 4, 2)}, {"a": "2019-08-14T08:04Z"}),
    ],
)
def test_convert_query_params(
    api: api_methods.APIMethods,
    test_query_params: api_methods.TQueryParams,
    expected: MutableMapping[str, str],
):
    actual = api._convert_query_params(test_query_params)
    assert actual == expected


@pytest.mark.parametrize(
    "test_body, expected",
    [
        ("some body text", b"some body text"),
        ("", b""),
        ([1, 2, 3], b"[1, 2, 3]"),
        (["a", "b", "c"], b'["a", "b", "c"]'),
        ({"foo": "bar"}, b'{"foo": "bar"}'),
        (None, None),
        (models.WriteApiSession(workspace_id="dev"), b'{"workspace_id": "dev"}'),
        (
            [
                models.WriteApiSession(workspace_id="dev"),
                models.WriteApiSession(workspace_id="dev"),
            ],
            b'[{"workspace_id": "dev"}, {"workspace_id": "dev"}]',
        ),
    ],
)
def test_get_serialized(
    api: api_methods.APIMethods, test_body: api_methods.TBody, expected: Optional[bytes]
):
    actual = api._get_serialized(test_body)
    assert actual == expected


@pytest.mark.parametrize(
    "test_response, test_structure, expected",
    [
        (
            transport.Response(
                ok=True,
                value=bytes(range(0, 10)),
                response_mode=transport.ResponseMode.BINARY,
            ),
            Union[str, bytes],
            bytes(range(0, 10)),
        ),
        (
            transport.Response(
                ok=True,
                value=b"some response text",
                response_mode=transport.ResponseMode.STRING,
            ),
            Union[str, bytes],
            "some response text",
        ),
        (
            transport.Response(
                ok=True,
                value=bytes("ئ", encoding="arabic"),
                response_mode=transport.ResponseMode.STRING,
                encoding="arabic",
            ),
            Union[str, bytes],
            "ئ",
        ),
        (
            transport.Response(
                ok=True, value=b"", response_mode=transport.ResponseMode.STRING
            ),
            None,
            None,
        ),
        (
            transport.Response(
                ok=True,
                value=bytes(
                    json.dumps(
                        {
                            "current_version": {
                                "full_version": "6.18.4",
                                "status": "fully functional",
                                "swagger_url": None,
                                "version": None,
                            },
                            "looker_release_version": "6.18",
                            "supported_versions": None,
                        }
                    ),
                    encoding="utf-8",
                ),
                response_mode=transport.ResponseMode.STRING,
            ),
            models.ApiVersion,
            models.ApiVersion(
                looker_release_version="6.18",
                current_version=models.ApiVersionElement(
                    version=None,
                    full_version="6.18.4",
                    status="fully functional",
                    swagger_url=None,
                ),
                supported_versions=None,
            ),
        ),
    ],
)
def test_return(
    api: api_methods.APIMethods,
    test_response: transport.Response,
    test_structure: api_methods.TStructure,
    expected: api_methods.TReturn,
):
    actual = api._return(test_response, test_structure)
    assert actual == expected


def test_return_raises_an_SDKError_for_bad_responses(api):
    with pytest.raises(error.SDKError) as exc:
        api._return(
            transport.Response(
                ok=False,
                value=b"some error message",
                response_mode=transport.ResponseMode.STRING,
            ),
            str,
        )
    assert "some error message" in str(exc.value)


@pytest.mark.parametrize(
    "method_path, expected_url",
    [
        ("/user", "/api/4.0/user"),
        ("user", "/api/4.0/user"),
        ("/user/1", "/api/4.0/user/1"),
        ("user/1", "/api/4.0/user/1"),
    ],
)
def test_api_versioned_url_is_built_properly(
    api: api_methods.APIMethods, method_path: str, expected_url: str
):
    assert api._path(method_path).endswith(expected_url)


@pytest.mark.parametrize(
    "value, expected",
    [
        ("foo/bar", "foo%2Fbar"),
        ("foo%2Fbar", "foo%2Fbar"),
        ("foo/bar?baz%20qux", "foo%2Fbar%3Fbaz%20qux"),
        ("foo/bar%20baz", "foo%2Fbar%20baz"),
    ],
)
def test_encode_path_param(api: api_methods.APIMethods, value: str, expected: str):
    assert api.encode_path_param(value) == expected


def test_reauthenticates_once_on_401(tmp_path, monkeypatch):
    for setting in ["BASE_URL", "CLIENT_ID", "CLIENT_SECRET"]:
        monkeypatch.delenv(f"LOOKERSDK_{setting}", raising=False)
    ini = tmp_path / "looker.ini"
    ini.write_text(
        "[Looker]\n"
        "base_url=https://host1.looker.com:19999\n"
        "client_id=test_id\n"
        "client_secret=test_secret\n"
    )
    settings = api_settings.ApiSettings(filename=str(ini), env_prefix="LOOKERSDK")

    login_calls = 0
    seen_auth_headers = []

    class ReauthMockTransport(transport.Transport):
        @classmethod
        def configure(cls, _settings):
            return cls()

        def request(
            self,
            method,
            path,
            query_params=None,
            body=None,
            authenticator=None,
            transport_options=None,
        ):
            nonlocal login_calls
            headers = {}
            if authenticator:
                headers.update(authenticator(transport_options or {}))
            if path.endswith("/login"):
                login_calls += 1
                payload = json.dumps(
                    {
                        "access_token": f"token-{login_calls}",
                        "token_type": "Bearer",
                        "expires_in": 3600,
                    }
                ).encode("utf-8")
                return transport.Response(
                    ok=True,
                    value=payload,
                    response_mode=transport.ResponseMode.STRING,
                    status_code=200,
                )
            seen_auth_headers.append(headers.get("Authorization"))
            if headers.get("Authorization") == "Bearer token-1":
                return transport.Response(
                    ok=False,
                    value=b'{"message": "Requires authentication."}',
                    response_mode=transport.ResponseMode.STRING,
                    status_code=401,
                )
            return transport.Response(
                ok=True,
                value=b"authenticated-ok",
                response_mode=transport.ResponseMode.STRING,
                status_code=200,
            )

    xp = ReauthMockTransport()
    session = auth_session.AuthSession(settings, xp, serialize.deserialize40, "4.0")
    sdk = api_methods.APIMethods(
        session, serialize.deserialize40, serialize.serialize40, xp, "4.0"
    )

    result = sdk.get("/user", str)
    assert result == "authenticated-ok"
    assert login_calls == 2
    assert seen_auth_headers == ["Bearer token-1", "Bearer token-2"]


def test_does_not_loop_on_persistent_401(tmp_path, monkeypatch):
    for setting in ["BASE_URL", "CLIENT_ID", "CLIENT_SECRET"]:
        monkeypatch.delenv(f"LOOKERSDK_{setting}", raising=False)
    ini = tmp_path / "looker.ini"
    ini.write_text(
        "[Looker]\n"
        "base_url=https://host1.looker.com:19999\n"
        "client_id=test_id\n"
        "client_secret=test_secret\n"
    )
    settings = api_settings.ApiSettings(filename=str(ini), env_prefix="LOOKERSDK")

    api_calls = 0
    login_calls = 0

    class Always401Transport(transport.Transport):
        @classmethod
        def configure(cls, _settings):
            return cls()

        def request(
            self,
            method,
            path,
            query_params=None,
            body=None,
            authenticator=None,
            transport_options=None,
        ):
            nonlocal api_calls, login_calls
            if authenticator:
                authenticator(transport_options or {})
            if path.endswith("/login"):
                login_calls += 1
                payload = json.dumps(
                    {
                        "access_token": f"token-{login_calls}",
                        "token_type": "Bearer",
                        "expires_in": 3600,
                    }
                ).encode("utf-8")
                return transport.Response(
                    ok=True,
                    value=payload,
                    response_mode=transport.ResponseMode.STRING,
                    status_code=200,
                )
            api_calls += 1
            return transport.Response(
                ok=False,
                value=b'{"message": "Requires authentication."}',
                response_mode=transport.ResponseMode.STRING,
                status_code=401,
            )

    xp = Always401Transport()
    session = auth_session.AuthSession(settings, xp, serialize.deserialize40, "4.0")
    sdk = api_methods.APIMethods(
        session, serialize.deserialize40, serialize.serialize40, xp, "4.0"
    )

    with pytest.raises(error.SDKError):
        sdk.get("/user", str)
    assert api_calls == 2
    assert not session.is_authenticated
