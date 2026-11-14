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

from looker_sdk.rtl import auth_token


def test_defaults_with_empty_token():
    """Confirm the defaults when initializing AuthToken without arguments."""
    actual = auth_token.AuthToken()

    assert actual.access_token == ""
    assert actual.token_type == ""
    assert actual.expires_in == 0
    assert actual.is_active is False


def test_is_active_with_full_token():
    """Confirm active token when AuthToken is initialized properly."""
    actual = auth_token.AuthToken(
        auth_token.AccessToken(
            access_token="all-access", token_type="backstage", expires_in=3600
        ),
    )

    assert actual.access_token == "all-access"
    assert actual.token_type == "backstage"
    assert actual.expires_in == 3600
    assert actual.is_active is True


def test_lag_time_is_used():
    """Confirm active token when expiration is > lag time."""
    actual = auth_token.AuthToken(
        auth_token.AccessToken(
            access_token="all-access", token_type="backstage", expires_in=9
        ),
    )

    assert actual.access_token == "all-access"
    assert actual.token_type == "backstage"
    assert actual.expires_in == 9
    assert actual.is_active is False

    actual = auth_token.AuthToken(
        auth_token.AccessToken(
            access_token="all-access", token_type="backstage", expires_in=11
        ),
    )

    assert actual.expires_in == 11
    assert actual.is_active is True


def test_uses_utc_for_expiration_and_reset_preserves_refresh_token():
    """Confirm AuthToken uses timezone-aware UTC datetimes and reset preserves refresh_token."""
    default_token = auth_token.AuthToken()
    assert default_token.expires_at.tzinfo == datetime.timezone.utc
    assert default_token.is_active is False

    active = auth_token.AuthToken(
        auth_token.AccessToken(
            access_token="utc-token",
            token_type="Bearer",
            expires_in=3600,
            refresh_token="refresh-me",
        )
    )
    assert active.expires_at.tzinfo == datetime.timezone.utc
    assert active.is_active is True

    active.reset()
    assert active.expires_at.tzinfo == datetime.timezone.utc
    assert active.is_active is False
    assert active.refresh_token == "refresh-me"

    # Naive expires_at is also evaluated against UTC
    naive_utc_token = auth_token.AuthToken(
        auth_token.AccessToken(
            access_token="naive-utc-token",
            token_type="Bearer",
            expires_in=3600,
        )
    )
    naive_utc_token.expires_at = datetime.datetime.now(
        datetime.timezone.utc
    ).replace(tzinfo=None) + datetime.timedelta(seconds=60)
    assert naive_utc_token.is_active is True
    naive_utc_token.expires_at = datetime.datetime.now(
        datetime.timezone.utc
    ).replace(tzinfo=None) - datetime.timedelta(seconds=1)
    assert naive_utc_token.is_active is False
