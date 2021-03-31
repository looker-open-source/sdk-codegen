# Cloud Function Example: User Provisioner

This is a [Google Cloud Function](https://cloud.google.com/functions) that takes an email address as input, and creates a Looker User on the attached instance for that email address.

It shows the use of several user-creation related endpoints / methods, and could easily be extended to disable users, modify users, and much more.

## Setup

1. Create a new cloud function. The Quickstart [here](https://cloud.google.com/functions/docs/quickstart-python) is useful if you're unfamiliar.

2. Select a Python runtime, and configure your access requirements

3. Make sure to add the required environment variables for the Looker SDK:
    LOOKERSDK_CLIENT_SECRET = yourclientsecret
    LOOKERSDK_CLIENT_ID = yourclientid
    LOOKERSDK_BASE_URL = https://yourinstance.looker.com
    LOOKERSDK_VERIFY_SSL = True

4. Copy and paste the contents of main.py into main.py and change the "Entrypoint" to "create_user"

5. Copy and paste the contents of requirements.txt into requirements.txt

6. Deploy

7. You can now access and test your cloud function. Depending on how you have configured authentication, you could send a POST request to it to test it with a body like {"email": "myemail@google.com"}. You can also test cloud functions from the cloud console, by clicking on the function and choosing the "Test" tab.