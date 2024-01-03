import getpass
import sys
import urllib.parse

import requests

from looker_sdk.rtl import api_settings, auth_session, requests_transport
from looker_sdk.sdk.api40 import methods
from looker_sdk.rtl import serialize


def oauth_interactive_roundtrip():
    username = input("\nemail: ")
    password = getpass.getpass()
    settings = api_settings.ApiSettings()
    transport = requests_transport.RequestsTransport.configure(settings)
    session = auth_session.OAuthSession(
        settings=settings,
        transport=transport,
        deserialize=serialize.deserialize31,
        serialize=serialize.serialize,
        crypto=auth_session.CryptoHash(),
        version="4.0",
    )
    auth_code_request_url = session.create_auth_code_request_url("api", "mystate")
    with requests.Session() as s:
        s.verify = False

        redirect_to_login = s.get(auth_code_request_url)
        csrf_token = urllib.parse.unquote(s.cookies["CSRF-TOKEN"])
        redirect = s.post(
            redirect_to_login.url,
            data={"csrf-token": csrf_token, "email": username, "password": password},
            allow_redirects=False,
        )
        assert redirect.next.path_url != "/login", "Failed to login to looker."

        while redirect.next:
            try:
                # 1. redirect to /auth
                # 2. (if already authorized app) redirect to settings.redirect_uri
                redirect = s.send(redirect.next, allow_redirects=False, timeout=2)
            except requests.exceptions.ConnectTimeout:
                # yep, redirected to settings.redirect_uri which doesn't exist hence
                # the timeout error. skip the app approval else block below
                break
        else:
            # redirected to app approval
            redirect = s.post(
                redirect.url,
                data={"csrf-token": csrf_token, "approve": "true"},
                allow_redirects=False,
            )
            assert redirect.status_code != 403, "User not allowed to authorize app!"

    # whether we had to authorize or were already authorized, we've now
    # been redirected to settings.redirect_uri, grab the Location header
    # query string to parse out the "code"
    qs = urllib.parse.urlparse(redirect.headers["Location"]).query
    params = urllib.parse.parse_qs(qs)
    assert "code" in params
    session.redeem_auth_code(params["code"][0])
    sdk = methods.Looker40SDK(
        session, serialize.deserialize31, serialize.serialize, transport, "4.0"
    )
    me = sdk.me()
    print(f"Hi {me.first_name}, your user_id is {me.id}")


if __name__ == "__main__":
    sys.exit(oauth_interactive_roundtrip())
