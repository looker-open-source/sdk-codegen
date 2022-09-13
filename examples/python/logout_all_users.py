from typing import cast, Sequence

import looker_sdk
from looker_sdk import models


sdk = looker_sdk.init40("../../looker.ini")


def main():
    users = get_all_users()

    if not users:
        print("No users found.")
        return

    count = 0
    for user in users:
        if user.sessions:
            terminate_sessions(cast(int, user.id), user.sessions)
            count += len(user.sessions)

    print(f"Terminated {count} session{'' if count == 1 else 's'}")


def get_all_users() -> Sequence[models.User]:
    """Return a list of users."""
    users = sdk.all_users(fields="id, sessions")
    return users


def terminate_sessions(user_id: int, sessions: Sequence[models.Session]):
    """Delete active sessions for a given user id."""
    for session in sessions:
        assert isinstance(session.id, int)
        sdk.delete_user_session(user_id, session.id)


main()
