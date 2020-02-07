===========
Looker SDK
===========

The Looker SDK for Python provides a convenient way to communicate with the
Looker API available on your Looker server. The library requires python3.7+
and is annotated using the typing module.

**DISCLAIMER**: This is a *beta* version of the Looker SDK, using a completely
new code generator developed by Looker. Implementations are still subject to
change, but we expect most SDK method calls to work correctly. If you run into
problems with the SDK, please feel free to
`report an issue <https://github.com/looker-open-source/sdk-codegen/issues>`_,
and please indicate which language SDK you're using in the report.

Basic Usage
===========
.. code-block:: python

    import looker_sdk


    sdk = looker_sdk.init31()  # or init40() for v4.0 API
    # and away you go
    my_user = sdk.me()
    new_user = looker_sdk.models.WriteUser(first_name="Jane", last_name="Doe")
    sdk.create_user(body=new_user)


sample project setup
====================

Install python 3.7. We highly recommend using
`pyenv <https://github.com/pyenv/pyenv#installation>`_ to install
different versions of python. Mac users should use
`homebrew <https://brew.sh/>`_ to install pyenv:

.. code-block:: bash

    brew install pyenv

Follow the **remaining steps 3 - 5** of
https://github.com/pyenv/pyenv#basic-github-checkout otherwise your python3.7
installation may break.

Now you're ready to install python 3.7:

.. code-block:: bash

    pyenv install 3.7.4

Next we'll use `pipenv <https://docs.pipenv.org/en/latest/#install-pipenv-today>`_
as an awesome enhancement to pip to manage project dependencies.

.. code-block:: bash

    brew install pipenv

Create a project directory

.. code-block:: bash

    mkdir looker-sdk-example

Install python3.7 and use it for this directory

.. code-block:: bash

    cd looker-sdk-example/
    pyenv local 3.7.4

Install looker_sdk using pipenv

.. code-block:: bash

    pipenv install --python 3.7 looker_sdk


Configuring the SDK
===================

The SDK supports configuration through a ``.ini`` file on disk as well
as setting environment variables <https://github.com/looker-open-source/sdk-codegen#environment-variable-configuration> (the latter override the former).

**Note**: The ``.ini`` configuration for the Looker SDK is a sample
implementation intended to speed up the initial development of python
applications using the Looker API. See this note on
`Securing your SDK Credentials <https://github.com/looker-open-source/sdk-codegen/blob/master/README.md#securing-your-sdk-credentials>`_
for warnings about using ``.ini`` files that contain your
API credentials in a source code repository or production environment.

In order to configure the SDK client, create a "looker.ini" file to reference
during ``client.setup()``

example file:

::

    [Looker]
    # Base URL for API. Do not include /api/* in the url
    base_url=https://self-signed.looker.com:19999
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
`See many python sdk examples in our examples repo <https://github.com/looker-open-source/sdk-examples/tree/master/python>`_
