===========
Looker SDK
===========

The Looker SDK for Python provides a convenient way to communicate with the
Looker API available on your Looker server. The library requires python3.6+
and is annotated using the typing module.

The SDK uses a plug-in architecture (also known as dependency injection) for
initializing that supports run-time specific transports (currently only
`RequestsTransport`) and different approaches for managing API authentication
(`AuthSession` and `OAuthSession`). The methods and models are generated from
the Looker API spec by a new code generator developed at Looker.

Please [report any issues](https://github.com/looker-open-source/sdk-codegen/issues)
encountered, and indicate the SDK language in the report.

Basic Usage
===========
.. code-block:: python

    import looker_sdk

    # For this to work you must either have set environment variables or created a looker.ini as described below in "Configuring the SDK"
    sdk = looker_sdk.init40()  # or init31() for the older v3.1 API
    my_user = sdk.me()

    # output can be treated like a dictionary
    print(my_user["first_name"])
    # or a model instance (User in this case)
    print(my_user.first_name)

    # input methods can take either model instances like WriteUser
    sdk.create_user(
        body=looker_sdk.models.WriteUser(first_name="Jane", last_name="Doe")
    )
    # or plain dictionaries
    sdk.create_user(body={"first_name": "Jane", "last_name": "Doe"})

Full tutorial
=============
Go from installation all the way to creating a functional micro-application in this 20-30 minute interactive tutorial.

*This tutorial is hosted in Google Colaboratory, an interactive online notebook. You can follow along right in the notebook by clicking the button below.*

.. image:: https://colab.research.google.com/assets/colab-badge.svg
   :target: https://colab.research.google.com/github/looker-open-source/sdk-codegen/blob/main/python/python-sdk-tutorial.ipynb


Sample project setup
====================

Install python 3.8. We highly recommend using
`pyenv <https://github.com/pyenv/pyenv#installation>`_ to install
different versions of python. Mac users should use
`homebrew <https://brew.sh/>`_ to install pyenv:

.. code-block:: bash

    brew install pyenv

Follow the **remaining steps 3 - 5** of
https://github.com/pyenv/pyenv#basic-github-checkout otherwise your python3.8
installation may break.

Now you're ready to install python 3.8:

.. code-block:: bash

    pyenv install 3.8.2

We'll use `pipenv <https://docs.pipenv.org/en/latest/#install-pipenv-today>`_
(fantastic virtualenv manager) to manage project dependencies.

.. code-block:: bash

    brew install pipenv

Create a project directory

.. code-block:: bash

    mkdir looker-sdk-example

Set python3.8 as the base interpreter for this directory

.. code-block:: bash

    cd looker-sdk-example/
    pyenv local 3.8.2

Install looker_sdk using pipenv

.. code-block:: bash

    pipenv --python 3.8.2 install --pre looker_sdk


Configuring the SDK
===================

The SDK supports configuration through a ``.ini`` file on disk as well
as `setting environment variables <https://github.com/looker-open-source/sdk-codegen#environment-variable-configuration>`_ (the latter override the former).

**Note**: The ``.ini`` configuration for the Looker SDK is a sample
implementation intended to speed up the initial development of python
applications using the Looker API. See this note on
`Securing your SDK Credentials <https://github.com/looker-open-source/sdk-codegen/blob/main/README.md#securing-your-sdk-credentials>`_
for warnings about using ``.ini`` files that contain your
API credentials in a source code repository or production environment.

In order to configure the SDK client, create a "looker.ini" file to reference
during ``client.setup()``

example file:

::

    [Looker]
    # Base URL for API. Do not include /api/* in the url. If hosted on GCP, remove the :19999 leaving just https://your.cloud.looker.com
    base_url=https://your.looker.com:19999
    # API 3 client id
    client_id=YourClientID
    # API 3 client secret
    client_secret=YourClientSecret
    # Set to false if testing locally against self-signed certs. Otherwise leave True
    verify_ssl=True

**Note**: If the application using the Looker SDK is going to be committed to a version control system, be sure to
**ignore** the ``looker.ini`` file so the API credentials aren't unintentionally published.

For any ``.ini`` setting you can use an environment variable instead. It takes the form of
``LOOKERSDK_<UPPERCASE-SETTING-FROM-INI>`` e.g. ``LOOKERSDK_CLIENT_SECRET``


Code example
============
`See many python sdk examples in our examples repo <https://github.com/looker-open-source/sdk-codegen/tree/main/examples/python>`_

Changelog
============
`Located in our github repo <https://github.com/looker-open-source/sdk-codegen/tree/main/python/CHANGELOG.md>`_
