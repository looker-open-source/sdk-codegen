===========
Looker SDK
===========

The Looker SDK for Python provides a convenient way to communicate with the Looker API
available on your Looker server. Typical usage often looks like this::

    #!/usr/bin/env python

    from looker.sdk import LookerSDK
    from looker.models import *

    sdk = LookerSDK()
    query = sdk.create_query(model="thelook", view="users",
                             fields=["users.id", "users.age", "users.city", "users.email", "users.first_name",
                                     "users.last_name", "users.zip", "users.state", "users.country"])
    json_result = sdk.run_query(query.id, "json")
    csv = sdk.run_query(query.id, "csv")

(Note the double-colon and 4-space indent formatting above.)

Paragraphs are separated by blank lines. *Italics*, **bold**,
and ``monospace`` look like this.


Configuring the SDK
===================

There is only one configuration step required to use the API with default connection information. The
Looker SDK uses a ``looker.ini`` file. This can be created by copying ``looker-sample.ini`` and setting
the values::

* ``base_url`` is the URL of the Looker server, like **https://mycompany.looker.com:19999**
* ``client_id`` is your API3 client id
* ``client_secret`` is your API3 client secret

A Sub-Section
-------------

Numbered lists look like you'd expect:

1. hi there

2. must be going

Urls are http://like.this and links can be
written `like this <http://www.example.com/foo/bar>`_.
