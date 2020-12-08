import ssl
import sys
import time
import urllib.request

# turn off ssl checking
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

MAX_RETRIES = 160
ATTEMPTS = 1
while MAX_RETRIES:
    retry_msg = f"after {ATTEMPTS} attempts: {MAX_RETRIES} retries remaining."
    try:
        status = urllib.request.urlopen(
            "https://localhost:10000/login", context=ctx
        ).getcode()
    except urllib.error.URLError:
        msg = f"Looker server connection rejected {retry_msg}"
    else:
        if status == 200:
            print(f"Looker ready after {ATTEMPTS} attempts.")
            sys.exit(0)
        else:
            msg = f"Received status({status}) from Looker {retry_msg}"

    ATTEMPTS += 1
    MAX_RETRIES -= 1
    time.sleep(2)
    print(msg)

print(f"Looker took too long to start {retry_msg}")
sys.exit(1)
