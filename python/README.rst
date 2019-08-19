===========
Looker SDK
===========

The Looker SDK for Python provides a convenient way to communicate with the Looker API
available on your Looker server. The library requires python3.7+ and is type annotated using
the typing module.

Typical usage often looks like this:

::

    from looker_sdk import client, models, error

    looker_client = client.setup('Looker.ini')

    user = looker_client.create_user(
        models.WriteUser(first_name="John", last_name="Doe", is_disabled=True, locale="fr")
    )
    looker_client.update_user(user.id, models.WriteUser(is_disabled=False, locale="uk"))
    looker_client.create_user_credentials_email(
        user.id, models.WriteCredentialsEmail(email="john.doe@looker.com")
    )

Note that there was no need to call the API /login endpoint. In fact there is no generated `login()`
method for this endpoint because it happens automatically in `looker_client` during the first api call.
The auth token is saved and subsequent API calls use it, renewing behind the scene when necessary.


The Python SDK supports the `/login/{user_id}`, "sudo", method as follows (continued code from above):

::

    # method 1: login_user ... logout
    looker_client.login_user(user.id)  # enter "sudo" state
    print(looker_client.me().first_name)  # prints user's first name
    looker_client.logout()  # exit "sudo" state
    print(looker_client.me().first_name)  # prints first name of api3credentials from 'looker.ini'

    # method2: context manager
    with looker_client.login_user(user.id):  # enter "sudo" state
	print(looker_client.me().first_name)  # prints user's first name
    print(looker_client.me().first_name)  # prints first name of api3credentials from 'looker.ini'


Configuring the SDK
-------------------

In order to configure the SDK client, create a "looker.ini" file to reference during `client.setup()`

example file:

::

    [Looker]
    # API version is required
    api_version=3.1
    # Base URL for API. Do not include /api/* in the url
    base_url=https://self-signed.looker.com:19999
    # API 3 client id
    client_id=YourClientID
    # API 3 client secret
    client_secret=YourClientSecret
    # Set to false if testing locally against self-signed certs. Otherwise leave True
    verify_ssl=True
