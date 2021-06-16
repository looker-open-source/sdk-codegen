""" 
This script transfers all schedules of a user to a different user using their email addreseses as parameter. 
The script may come in handy when a user leaves an organization, and Looker admins have to re-assign all of 
their existing schedules to a new user.

The script is using customized if/else conditions to check for edge cases (i.e. if email addresses are associated 
with existing Looker users, if a user has any schedules, etc.) before reading data and calling the functions.

Author: Lan
Last modified: June 16, 2021
"""
import looker_sdk

sdk = looker_sdk.init40()

def find_user_id(email: str):
     
  """ Given an email address, find the corresponding Looker user id
  Args:    email (str)  
  Returns: the Looker user id associated with the email addresses (int)
  Raises:  N/A (does not explicitly raise an exception)
  """
  user_id = sdk.search_users(email=email)
  
  """ Customized logic block to check if an email address is associated with a Looker user"""
  if len(user_id) == 0: 
    return 'There is no user associated with this email' 
  else:
    return user_id[0]['id']
  
 
def find_schedules(user_id: int):
     
  """ Return all schedules of a particular user id
  Args:    user_id (int) 
  Returns: all schedules of a particular user: result = {'name_of_schedule_plan': id_of_schedule_plan}
  Raises:  N/A (does not explicitly raise an exception)
  """
  result = {}
  schedule_plans = sdk.all_scheduled_plans(user_id=user_id)
  for i in schedule_plans:
    result[i['name']] = i['id']
  return result


def update_owner(current_owner_email: str, new_owner_email: str):

  """ Transfer all schedules of `foo@looker.com` to `bar@looker.com`
  Args:    current_owner_email (str), new_owner_email (str) 
  Returns: None (a warning message or a success message will be printed to console) 
  Raises:  customized warning messages in if/else block 
  """
  current_owner_id = find_user_id(current_owner_email)
  new_owner_id = find_user_id(new_owner_email)  
  
  """ This block is executed to check if email addresses provided are associated with two Looker users """
  
  if type(new_owner_id) != int and type(new_owner_id) != int:
    print("The email addresses for both the current owner and the new owner are not associated with any Looker user id")

  elif type(current_owner_id) != int: 
    print("The email address for the current owner is not associated with any Looker user id")

  elif type(new_owner_id) != int:
    print("The email address for the new owner is not associated with any Looker user id")

  else: 
    body = {}
    body['user_id'] = new_owner_id
    find = find_schedules(current_owner_id) 
    for i in find.values(): 
        sdk.update_scheduled_plan(i,body)
    print("Successfully transfer all schedules of " + current_owner_email + " to " + new_owner_email)

# Call the function 
update_owner('foo@looker.com', 'bar@looker.com')
