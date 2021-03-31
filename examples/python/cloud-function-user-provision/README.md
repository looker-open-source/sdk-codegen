# Cloud Function Example: User Provisioner

This is a [Google Cloud Function](https://cloud.google.com/functions) that takes an email address as input, and creates a Looker User on the attached instance for that email address.

It shows the use of several user-creation related endpoints / methods, and could easily be extended to disable users, modify users, and much more.

It's also an easy template for setting up Google Cloud Functions with the Looker API to build serverless microservices that interact with Looker.

## Setup

1. Create a new Cloud Function and select a Python runtime. The Quickstart [here](https://cloud.google.com/functions/docs/quickstart-python) is useful if you're unfamiliar.

2. Carefully configure your access and authentication requirements.

3. Add the required environment variables for the Looker SDK:
    LOOKERSDK_CLIENT_SECRET = yourclientsecret
    LOOKERSDK_CLIENT_ID = yourclientid
    LOOKERSDK_BASE_URL = https://yourinstance.looker.com
    LOOKERSDK_VERIFY_SSL = True

4. Once in the IDE, copy and paste the contents of main.py into main.py and change the "Entrypoint" in the top right to "create_user".

5. Copy and paste the contents of requirements.txt into requirements.txt. This lets the cloud function install the right libraries.

6. Deploy.

7. You can now invoke and test your cloud function. Depending on how you have configured authentication, you could send a POST request to test it with a body like {"email": "myemail@google.com"}. You can also test cloud functions from the cloud console, by clicking on the function and choosing the "Test" tab. Any email you provide in a POST request to this service will be created as a Looker user on the instance attached and will receive a "Welcome to Looker" email.