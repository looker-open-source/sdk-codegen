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

Sample project setup
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

    pipenv install --python 3.7 --pre looker_sdk


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

**Note**: If the application using the Looker SDK is going to be committed to a version control system, be sure to
**ignore** the ``looker.ini`` file so the API credentials aren't unintentionally published.

For any ``.ini`` setting you can use an environment variable instead. It takes the form of
``LOOKERSDK_<UPPERCASE-SETTING-FROM-INI>`` e.g. ``LOOKERSDK_CLIENT_SECRET``


Code example
============
Copy the following code block into `example.py`. Note: it's helpful to launch your
code editor with your virtual environment loaded so that it can find the looker_sdk
library and give you a nice code completion experience. Run :code:`pipenv shell` to
start load the virtual environment and then run your editor command
(e.g. for VSCode - :code:`code example.py`)


.. code-block:: python

    from looker_sdk import client, models, error

    # client calls will now automatically authenticate using the
    # api3credentials specified in 'looker.ini'
    sdk = client.setup("looker.ini")
    looker_api_user = sdk.me()

    # models can be passed named parameters to the constructor
    new_user = models.WriteUser(first_name="John", last_name="Doe")

    # as well as have fields set on the instance
    new_user.is_disabled = True
    new_user.locale = "fr"

    # create the user with the client
    created_user = sdk.create_user(new_user)
    print(
        f"Created user({created_user.id}): "
        f"{created_user.display_name} "
        f"locale({created_user.locale})"
    )


    # Updating the user: change first_name and explicitly nullify
    # locale so that it defaults to looker system locale
    update_user = models.WriteUser(
        first_name="Jane", locale=models.EXPLICIT_NULL  # do not use None
    )

    # update the user with the client
    user_id = created_user.id
    updated_user = sdk.update_user(user_id, body=update_user)
    print(
        f"Updated user({user_id}): {updated_user.display_name} "
        f"locale({updated_user.locale})"
    )

    # perform API calls on behalf of the user: "sudo"
    try:
        print(f"Sudo as {user_id}")
        sdk.login_user(user_id)
    except error.SDKError:
        print(f"Oops, we need to enable user({user_id}) first")
        sdk.update_user(user_id, body=models.WriteUser(is_disabled=False))
        sdk.login_user(user_id)

    sudo_user = sdk.me()
    assert sudo_user.id == user_id
    assert sudo_user.id != looker_api_user.id

    # logout to switch back to authenticating per 'looker.ini'
    sdk.logout()
    print(f"Ending sudo({user_id}) session")
    assert sdk.me().id == looker_api_user.id

    # "sudo" using a context manager
    with sdk.login_user(user_id):
        assert sdk.me().id == user_id

    # exiting context manager is the same as
    # calling sdk.logout()
    assert sdk.me().id == looker_api_user.id

    # cleanup
    sdk.delete_user(user_id)
    print(f"Removed user({user_id})")

You can run the example code above but *be aware* it will actually create and
delete a user in your looker instance.

.. code-block:: bash

    pipenv run python example.py

If you see a lot of `InsecureRequestWarning` errors because you're running
against an instance with a self-signed cert, this will clean up the output:

.. code-block:: bash

    PYTHONWARNINGS=ignore pipenv run python example.py


A note on static type checking
==============================

All client calls are annotated with with basic types as well as model types.
Many client calls accept a ``fields`` argument which limits the JSON response
from the API to the specified fields. For this reason, the all properties on the
model are all typed as ``Optional[]``. The effect is that static code analysis
(`mypy <https://mypy.readthedocs.io/en/latest/>`_ for example) will complain
if you try to use a field from a model instance in a place that requires
the value not be ``Optional``. From the example above

.. code-block:: python

    created_user = sdk.create_user(new_user)
    user_id = created_user.id

    # mypy error: Argument "user_id" to "update_user" of "LookerSDK"
    # has incompatible type "Optional[int]"; expected "int"
    sdk.update_user(user_id, ...)

This is because ``created_user.id`` has type ``Optional[int]`` but we need to use
it in the ``update_user()`` call which is annotated like this:

.. code-block:: python

    def update_user(
        self,
        user_id: int,  # note: not Optional[int]
        body: models.WriteUser,
        fields: Optional[str] = None,
    ) -> models.User:

*We* know that ``created_user.id`` is an ``int`` (we didn't pass in a ``fields``
argument to ``create_user()`` excluding ``id`` from the response). However, mypy
does not so we must guide it in one of the following ways

.. code-block:: python

    # assert about the type
    assert isinstance(user_id, int)

    # or cast
    from typing import cast
    user_id = cast(created_user.id, int)

Now mypy is happy with ``update_user(user_id, ...)``
