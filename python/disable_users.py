from looker_sdk import client, models


admin_client = client.setup("../../looker.ini")

# List of user ids to disable
user_ids = [100, 105, 106, 1800]

for user_id in user_ids:
    found = admin_client.search_users(id=user_id)
    if found:
        admin_client.update_user(user_id, models.WriteUser(is_disabled=True))
        print(f"user {user_id}: disabled")
    else:
        print(f"user {user_id}: not found")
