import functools

from looker_sdk import client, methods, models, error


def register_user(
    *, hackathon: str, first_name: str, last_name: str, email: str
) -> None:
    sdk = client.setup()

    user = find_or_create_user(
        sdk=sdk, first_name=first_name, last_name=last_name, email=email
    )
    assert user.id
    if not user.credentials_email:
        create_email_credentials(sdk=sdk, user_id=user.id, email=email)
    if not user.credentials_api3:
        create_api3_credentials(sdk=sdk, user_id=user.id)
    set_user_roles(sdk=sdk, user_id=user.id)
    set_user_attributes(sdk=sdk, user_id=user.id, hackathon=hackathon)
    disable_user(sdk=sdk, user_id=user.id)


def find_or_create_user(
    *, sdk: methods.LookerSDK, first_name: str, last_name: str, email: str
) -> models.User:
    try:
        users = sdk.search_users(email=email)
        if users:
            user = users[0]
            if (
                user.first_name != first_name
                or user.last_name != last_name
                or user.is_disabled
            ):
                assert user.id
                user = sdk.update_user(
                    user_id=user.id,
                    body=models.WriteUser(
                        first_name=first_name, last_name=last_name, is_disabled=False
                    ),
                )
        else:
            user = sdk.create_user(
                models.WriteUser(first_name=first_name, last_name=last_name)
            )
    except error.SDKError as create_ex:
        raise RegisterError(f"Failed to find or create User ({create_ex})")
    return user


def try_to(func):
    """Wrap API calls in try/except
    """

    @functools.wraps(func)
    def wrapped_f(**kwargs):
        try:
            return func(**kwargs)
        except error.SDKError as ex:
            raise RegisterError(f"Failed to {func.__name__}: ({ex})")

    return wrapped_f


@try_to
def create_email_credentials(*, sdk: methods.LookerSDK, user_id: int, email: str):
    sdk.create_user_credentials_email(
        user_id=user_id, body=models.WriteCredentialsEmail(email=email)
    )


@try_to
def create_api3_credentials(*, sdk: methods.LookerSDK, user_id):
    sdk.create_user_credentials_api3(user_id=user_id, body=models.CredentialsApi3())


@try_to
def set_user_roles(*, sdk: methods.LookerSDK, user_id):
    hack_roles = {"Developer", "Hackathon"}
    role_ids = []
    for role in sdk.all_roles(fields="name,id"):
        if role.name in hack_roles:
            assert role.id
            role_ids.append(role.id)
    sdk.set_user_roles(user_id=user_id, body=role_ids)


@try_to
def set_user_attributes(*, sdk: methods.LookerSDK, user_id, hackathon):
    user_attrs = sdk.all_user_attributes(fields="name,id")
    for user_attr in user_attrs:
        if user_attr.name == "hackathon":
            hackathon_attr_id = user_attr.id
            break
    else:
        raise RegisterError("Could not find 'hackathon' user attribute")
    assert hackathon_attr_id
    sdk.set_user_attribute_user_value(
        user_id=user_id,
        user_attribute_id=hackathon_attr_id,
        body=models.WriteUserAttributeWithValue(value=hackathon),
    )


@try_to
def disable_user(*, sdk: methods.LookerSDK, user_id: int):
    sdk.update_user(user_id=user_id, body=models.WriteUser(is_disabled=True))


def me():
    sdk = client.setup()
    return sdk.me()


class RegisterError(Exception):
    """Failed to register user in looker instance.
    """
