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

# If not using Google Sheet, removing Google modules here and in `requirements.txt`
from googleapiclient.discovery import build
import google.auth

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
  """Take email from a cell inside an existing Google Sheet"""
  try: 
    email = get_email_from_sheet()
    result = looker_user_provision(email=email)
    return result 
  except:
    return 'An error occurred.'

def get_email_from_sheet():
  """ Authenticate to an existing Google Sheet using the default runtime 
  service account and extract the email address from a cell inside the sheet. 
  
  Refer to Google Sheet API Python Quickstart for details: 
  https://developers.google.com/sheets/api/quickstart/python
  """
  # Get the key of an existing Google Sheet from the URL. 
  # Example: https://docs.google.com/spreadsheets/d/[KEY HERE]/edit#gid=111
  SAMPLE_SPREADSHEET_ID = "foo"

  # Google Sheet Range: https://developers.google.com/sheets/api/samples/reading
  SAMPLE_RANGE_NAME = "Sheet1!A:A"

  creds, _proj_id = google.auth.default()
  service = build("sheets", "v4", credentials=creds)
  sheet = service.spreadsheets()
  result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID,
                                range=SAMPLE_RANGE_NAME).execute()
  
  # `values` will be a list of lists (i.e.: [['email1'], ['email2']])
  # and we can access value 'email' using index
  values = result.get('values', [])
  email = values[0][0]
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
