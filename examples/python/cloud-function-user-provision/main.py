"""This Cloud Function leverages Looker Python SDK to manage user provision. 
It takes an email address as an input, then checks if this email has been 
associated with an existing Looker user. If a current user is found, then an 
email to reset the password will be sent. Otherwise, a new user will be created, 
and a setup email will be sent.

The `main` function is triggered through an HTTP request. Two example approaches 
are provided below:
  main(request): take a POST request in form of {"email":"test@test.com"}, 
    and read the email value from the request body
  main_gsheet(request): take a GET request and read the email value from a cell
    inside an existing Google sheet. 

HTTP Cloud Functions: https://cloud.google.com/functions/docs/writing/http#sample_usage"""

# If not using Google Sheet, removing `gspread` here and in `requirements.txt`
import gspread

import looker_sdk
sdk = looker_sdk.init40()

# [START main(request)]
def main(request):
  """Take email from JSON body of a POST request, and use the email value 
  as an input for looker_user_provision() function"""
  try: 
    request_json = request.get_json()
    email = request_json["email"]
    result = looker_user_provision(email=email)
    return result 
  except:
    return 'Please provide JSON in the format of {"email":"test@test.com"}'
# [END main(request)]

# [START main_gsheet(request)]
def main_gsheet(request):
  """Take email from a cell inside an existing Google Sheet, leveraging 
  GCP's service accounts and gspread, Google Sheet's Python module"""
  try: 
    email = get_email_from_sheet()
    result = looker_user_provision(email=email)
    return result 
  except:
    return 'An error occurred.'

def get_email_from_sheet():
  """Authenticate to an existing Google Sheet using a service account. 
  GCP's Cloud Function is often run unattended, so a service account 
  (a machine-to-machine Google account) is preferred for authentication. 
  Info: https://docs.gspread.org/en/v4.0.1/oauth2.html#for-bots-using-service-account
  """
  # `service_account.json` is in the same directory of this function
  gc = gspread.service_account(filename='service_account.json')

  # Get the key of an existing Google Sheet, obtainabled in the URL of the sheet. 
  # Example: https://docs.google.com/spreadsheets/d/[KEY HERE]/edit#gid=111
  sh = gc.open_by_key('foo')

  # Get the email value. Set up additional logic here
  worksheet = sh.get_worksheet(0)
  email = worksheet.acell('A1').value
  return email
# [END main_gsheet(request)]
  
# [START looker_user_provision]
def looker_user_provision(email):
  user_id = search_users_by_email(email=email)
  if user_id is not None:
    sdk.send_user_credentials_email_password_reset(user_id=user_id)
    return f'A user with this email: {email} already existed; Password reset sent.'
  else: 
    create_users(email=email)
    return f'New user created; Setup/Welcome email sent to {email}.'

def search_users_by_email(email):
  """An email can only be assigned to one user in a Looker instance. 
  Therefore, search_user(email=test@test.com) will result in either
  an empty dictionary, or a dictionary containing one user at index 0"""  
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
  
# [END looker_user_provision]
