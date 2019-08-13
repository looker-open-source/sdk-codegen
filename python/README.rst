
===========
Looker SDK
===========

The Looker SDK for Python provides a convenient way to communicate with the Looker API
available on your Looker server. Typical usage often looks like this:

::

    #!/usr/bin/env python

    from looker_sdk import client, models

    client_manager = client.setup()

    with client_manager.get_admin_client() as admin_client:
        user = admin_client.create_user(
            ml.WriteUser(first_name="John", last_name="Doe", is_disabled=True, locale="fr"
        )
        admin_client.update_user(user.id, ml.WriteUser(is_disabled=False, locale="uk"))
        admin_client.create_user_credentials_email(
            user.id, ml.WriteCredentialsEmail(email="john.doe@looker.com")
        )

    with client_manager.get_user_client(user.id) as user_client:
        user_info = user_client.me()


Configuring the SDK
-------------------

There is only one configuration step required to use the API with default connection information. The
Looker SDK uses a ``looker.ini`` file. This can be created by copying ``looker-sample.ini`` and setting
the values:

* `base_url` is the URL of the Looker server, like *https://mycompany.looker.com:19999*
* `client_id` is your API3 client id
* `client_secret` is your API3 client secret
