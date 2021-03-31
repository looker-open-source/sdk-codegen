import requests
import looker_sdk
import os

"""
This Google Cloud Function takes in an email address and create
a looker user based on another value provided. It could be easily adapted to accept an array
of email addresses, to catch a webhook from a third party service, and much more.

It could also easily be adapted to accept a second parameter and disable users as well.

Example body: {"email": "test@test.com"}
"""

# We init the SDK in the "global scope" so that we don't have to do it on every execution.
# This saves time if the function is called multiple times within a short timeframe.

sdk = looker_sdk.init40()

def create_user(request):
    request_json = request.get_json()

    # You could set up any kind of parsing you'd like here. In this case, it's just receiving an email.
    # You could catch a webhook with a user_id, then make an API call to another service to get an email.
    if request_json['email']:
        email = request_json['email']
        #Create user
        newuser = sdk.create_user(
            body=looker_sdk.models40.WriteUser(
                credentials_email=looker_sdk.models40.WriteCredentialsEmail(
                    email=email,
                    forced_password_reset_at_next_login=False
                ),
                is_disabled=False,
                models_dir_validated=False
            )
        )
        if newuser:
            #Add the new user to a specific group, to handle permissions and access
            sdk.add_group_user(
                group_id=15, body=looker_sdk.models40.GroupIdForGroupUserInclusion(user_id=newuser.id)
            )
            #Create email credentials for the new user
            sdk.create_user_credentials_email(
                user_id=newuser.id,
                body=looker_sdk.models40.WriteCredentialsEmail(
                    email=email,
                    forced_password_reset_at_next_login=False
                ))
            #Send them a setup/welcome email
            sdk.send_user_credentials_email_password_reset(newuser.id)
            return "New user created",200
        else:
            #If the initial creation request failed, it's likely because the user already exists in Looker. We check for that here.
            looker_user_id = sdk.search_users(email=email)[0].id
            res = sdk.send_user_credentials_email_password_reset(looker_user_id)
            if res == 200:
                return "User already existed; Password reset sent", 200
            else:
                return "Failure in user creation.", 400
    else:
        return "No email provided", 422
