import functools
import re
from typing import Dict, Sequence

import looker_sdk
from looker_sdk import methods, models, error


LOOKER_GROUP_PREFIX = "Looker_Hack: "
# simple caching mechanism until we have a true class for retaining these IDs
HACKATHON_ATTR_ID = None
HACKATHON_ROLE = None


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
def get_hackathon_attr_id(*, sdk: methods.LookerSDK) -> int:
    global HACKATHON_ATTR_ID
    if HACKATHON_ATTR_ID is not None:
        return HACKATHON_ATTR_ID

    main_hackathon = "hackathon"
    user_attrs = sdk.all_user_attributes(fields="name,id")
    for user_attr in user_attrs:
        if user_attr.name == main_hackathon:
            assert user_attr.id
            HACKATHON_ATTR_ID = user_attr.id
            break
    else:
        attrib = sdk.create_user_attribute(
            body=models.WriteUserAttribute(
                name=main_hackathon, label="Looker Hackathon", type="string"
            )
        )
        if not attrib:
            raise RegisterError(f"Could not find '{main_hackathon}' user attribute")
        else:
            assert attrib.id
            HACKATHON_ATTR_ID = attrib.id

    return HACKATHON_ATTR_ID


@try_to
def get_hackathon_role(*, sdk: methods.LookerSDK) -> models.Role:
    global HACKATHON_ROLE
    if HACKATHON_ROLE is not None:
        return HACKATHON_ROLE

    for role in sdk.all_roles(fields="name,id"):
        if role.name == "Hackathon":
            HACKATHON_ROLE = role
            assert HACKATHON_ROLE.id
            break
    else:
        raise RegisterError("Hackathon role needs to be created")

    return HACKATHON_ROLE


def register_user(
    *, hackathon: str, first_name: str, last_name: str, email: str
) -> str:
    sdk = looker_sdk.init31()

    user = find_or_create_user(
        sdk=sdk, first_name=first_name, last_name=last_name, email=email
    )
    assert user.id
    if not user.credentials_email:
        create_email_credentials(sdk=sdk, user_id=user.id, email=email)
    if user.credentials_api3:
        client_id = user.credentials_api3[0].client_id
    else:
        client_id = create_api3_credentials(sdk=sdk, user_id=user.id).client_id
    set_user_group(sdk=sdk, user_id=user.id, hackathon=hackathon)
    set_user_attributes(sdk=sdk, user_id=user.id, hackathon=hackathon)
    disable_user(sdk=sdk, user_id=user.id)
    assert client_id
    return client_id


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


def enable_users_by_hackathons(hackathons: Sequence[str]) -> Dict[str, str]:
    global LOOKER_GROUP_PREFIX
    sdk = looker_sdk.init31()
    groups = {g.name: g.id for g in sdk.all_groups(fields="id,name")}
    ret = {}
    for hackathon in hackathons:
        try:
            group_id = groups[f"{LOOKER_GROUP_PREFIX}{hackathon}"]
        except KeyError:
            raise RegisterError(f"No group found for hackathon: '{hackathon}'")
        for user in sdk.search_users(group_id=group_id):
            assert user.id
            assert user.email
            sdk.update_user(user_id=user.id, body=models.WriteUser(is_disabled=False))
            password_reset_url = sdk.create_user_credentials_email_password_reset(
                user_id=user.id, expires=False
            ).password_reset_url
            assert password_reset_url
            setup = re.sub("password/reset", "account/setup", password_reset_url)
            ret[user.email] = setup
    return ret


@try_to
def create_email_credentials(*, sdk: methods.LookerSDK, user_id: int, email: str):
    sdk.create_user_credentials_email(
        user_id=user_id, body=models.WriteCredentialsEmail(email=email)
    )


@try_to
def create_api3_credentials(
    *, sdk: methods.LookerSDK, user_id: int
) -> models.CredentialsApi3:
    return sdk.create_user_credentials_api3(
        user_id=user_id, body=models.CredentialsApi3()
    )


@try_to
def set_user_group(*, sdk: methods.LookerSDK, user_id: int, hackathon: str):
    global LOOKER_GROUP_PREFIX
    # TODO - switch to sdk.search_groups once that method is live on
    # sandboxcl and hack instances
    groups = sdk.all_groups(fields="id,name")
    name = f"{LOOKER_GROUP_PREFIX}{hackathon}"
    for group in groups:
        if group.name == name:
            break
    else:
        role = get_hackathon_role(sdk=sdk)
        assert role.id
        role_groups = []
        for g in sdk.role_groups(role_id=role.id, fields="id"):
            assert g.id
            role_groups.append(g.id)
        group = sdk.create_group(body=models.WriteGroup(name=name))
        assert group.id
        role_groups.append(group.id)
        sdk.set_role_groups(role_id=role.id, body=role_groups)

    assert group.id
    sdk.add_group_user(
        group_id=group.id, body=models.GroupIdForGroupUserInclusion(user_id=user_id)
    )


@try_to
def set_user_attributes(*, sdk: methods.LookerSDK, user_id, hackathon):
    hackathon_attr_id = get_hackathon_attr_id(sdk=sdk)
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
    sdk = looker_sdk.init31()
    return sdk.me()


class RegisterError(Exception):
    """Failed to register user in looker instance.
    """
