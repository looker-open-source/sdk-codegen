import csv
import sys
from typing import Optional, Sequence

from looker_sdk import client, error, models


sdk = client.setup("../looker.ini")


def main():
    """Given a CSV file containing a users' first names, last names and email addresses,
    provision them with an account and assign them the specified roles and groups.
    """
    filename = sys.argv[1] if len(sys.argv) > 1 else ""
    role = sys.argv[2] if len(sys.argv) > 2 else ""
    group = sys.argv[3] if len(sys.argv) > 3 else ""

    if not (filename and role and group):
        print("Please provide: <csvFilename> <role> <group>")
        return

    with open(filename) as f:
        reader = csv.DictReader(f)
        for user_details in reader:
            try:
                user_id = create_user(
                    user_details["first_name"],
                    user_details["last_name"],
                    user_details["email"],
                )
            except error.SDKError as e:
                print(e)
                continue
            else:
                set_role(user_id, role)
                set_group(user_id, group)
                print(f"User account created for {user_details['email']}")


def create_user(first_name: str, last_name: str, email: str) -> int:
    """Provision an account for the given email address."""
    if is_created(email):
        raise error.SDKError(
            f"A user already exists with email={email}"
        )  # TODO: change this to raise another error. maybe create own error class.
    user = sdk.create_user(models.WriteUser(first_name=first_name, last_name=last_name))
    assert isinstance(user.id, int)
    sdk.create_user_credentials_email(
        user.id, models.WriteCredentialsEmail(email=email)
    )
    return user.id


def is_created(email: str) -> bool:
    """Checks if a user with the provided email already exists."""
    found = sdk.search_users(email=email)
    return True if found else False


def set_role(user_id: int, role: str):
    """Set role/s to user associated with specified id."""
    all_roles = sdk.all_roles()
    resp: Optional[Sequence[models.Role]] = None
    for r in all_roles:
        if r.name and (r.name.lower() == role.lower()):
            assert isinstance(r.id, int)
            resp = sdk.set_user_roles(user_id, [r.id])
            break

    if not resp:
        raise error.SDKError(f"Role {role} not found.")  # TODO: change.


def set_group(user_id: int, group: str):
    """Add user associated with specified id to group."""
    all_groups = sdk.all_groups()
    resp: Optional[models.User] = None
    for g in all_groups:
        if g.name and g.name.lower() == group.lower():
            assert isinstance(g.id, int)
            resp = sdk.add_group_user(
                g.id, models.GroupIdForGroupUserInclusion(user_id=user_id)
            )
            break
    if not resp:
        raise error.SDKError(f"Group {group} not found.")  # TODO: change.


main()
