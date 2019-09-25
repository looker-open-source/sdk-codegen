from typing import cast, MutableSequence, Optional, Sequence

from looker_sdk import client, methods, models


def main():
    api_client = client.setup("../looker.ini")

    users = get_all_users(api_client)

    terminations_count = 0
    for user in users:
        if user.sessions:
            terminate_sessions(api_client, user.id, user.sessions)
            terminations_count += len(user.sessions)

    generate_report(terminations_count)


def get_all_users(api_client: methods.LookerSDK) -> Sequence[models.User]:
    return api_client.all_users(fields="id, sessions")


def terminate_sessions(
    api_client: methods.LookerSDK, user_id: int, sessions: Sequence[models.Session]
):
    for session in sessions:
        api_client.delete_user_session(user_id, cast(int, session.id))


def generate_report(count: int):
    print(f"Terminated {count} session{'' if count == 1 else 's'}")


main()
