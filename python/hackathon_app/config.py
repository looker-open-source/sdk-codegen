import base64
import os


SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")
WTF_CSRF_SECRET_KEY = os.environ.get("FLASK_WTF_CSRF_SECRET_KEY")

GOOGLE_SHEET_ID = os.environ.get("GOOGLE_SHEET_ID")
assert GOOGLE_SHEET_ID

_google_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIAL_ENCODED")
assert _google_creds
GOOGLE_APPLICATION_CREDENTIALS = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
assert GOOGLE_APPLICATION_CREDENTIALS
with open(GOOGLE_APPLICATION_CREDENTIALS, "wb") as f:
    f.write(base64.b64decode(_google_creds))
