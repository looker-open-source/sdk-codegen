"""This Cloud Function leverages Looker Python SDK to manage user provision. The 
`main` function is used as the entry point to the code. It takes an email address 
as an input through a POST request, then checks if this email has been associated
with an existing Looker user. If an exisiting user is found, then an email to 
reset password will be sent. Otherwise, a new user will be created, and a setup email
will be sent.

HTTP Cloud Functions: https://cloud.google.com/functions/docs/writing/http#sample_usage"""

import looker_sdk
sdk = looker_sdk.init40()

def main(request):
  try: 
    request_json = request.get_json()
    email = request_json["email"]
    result = looker_user_provision(email=email)
    return result 
  except:
    return 'Please provide JSON in the format of {"email":"test@test.com"}'
  
def looker_user_provision(email):
  user_id = search_users_by_email(email=email)
  if user_id is not None:
    sdk.send_user_credentials_email_password_reset(user_id=user_id)
    return 'A user with this email: {email} already existed; Password reset sent'.format(email=email)
  elif user_id is None: 
    create_users(email=email)
    return 'New user created; Setup/Welcome email sent to {email}'.format(email=email)

def search_users_by_email(email):
  users = sdk.search_users(email=email)
  if len(users) == 0:
    return None 
  else: 
    return users[0]["id"]

def create_users(email):
  new_user = sdk.create_user(
            body=looker_sdk.models40.WriteUser(
                credentials_email=looker_sdk.models40.WriteCredentialsEmail(
                    email=email,
                    forced_password_reset_at_next_login=False
                ),
                is_disabled=False,
                models_dir_validated=False
            )
        )
      
  # Create email credentials for the new user
  sdk.create_user_credentials_email(
                user_id=new_user.id,
                body=looker_sdk.models40.WriteCredentialsEmail(
                    email=email,
                    forced_password_reset_at_next_login=False
                ))
   
  # Send a welcome/setup email
  sdk.send_user_credentials_email_password_reset(user_id=new_user["id"])