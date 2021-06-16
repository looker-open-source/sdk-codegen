""" 
The purpose of this script is to add a specific Dashboard or Board to "Favorites" 
for a list of users, which may help new users discover useful Looker contents quicker and easier. 

The script contains two functions (add_boards_to_users and add_dashboards_to_users) that are similar 
in logic and execution. Example function calls are placed at the end of the script. 

Author: Lan
Last modified: June 16, 2021
"""

import looker_sdk

sdk = looker_sdk.init40()  

def add_boards_to_users(board_id: int, users_id: list):

  """ Add a specific board to the "Favorite" contents for a list of user
  
  Args: 
    board_id (int): id of a Looker board (https://company.looker.com/boards/id)
    users_id (list): a list of users id (int) in the form of a native Python list
  
  Returns: "Successfully added!" (str)
  
  Raises: N/A (does not explicitly raise an exception); Looker SDK will raise an error.
  """
 
  content_metadata_id = sdk.board(board_id=board_id)['content_metadata_id'] 

  """An admin can not update the list of favorite contents for users, 
  so sdk.auth.login_user() and sdk.auth.logout() are called to sudo as each user to call `create_content_favorite()"""
  for i in users_id: 
    sdk.auth.login_user(i)
    params = {}
    params["user_id"] = i 
    params["content_metadata_id"] = content_metadata_id
    sdk.create_content_favorite(params)
    sdk.auth.logout() 

  print("Successfully added!")



""" The logic for `add_dashboards_to_users` is the same, except that `dashboard_id` is a string (because LookML dashboard id is a string). 
Also, we are using `sdk.dashboard()` to retrieve `content_metadata_id`"""


def add_dashboards_to_users(dashboard_id: str, users_id: list):

  """ Add a specific dashboard to the list of favorite contents for a list of user
  
  Args: 
    dashboard_id (str): id of a Looker dashboard (https://company.looker.com/dashboards/id)
    users_id (list): a list of users id in the form of a native Python list
  
  Returns: "Successfully added!" (str)
  
  Raises: N/A (does not explicitly raise an exception); Looker SDK will raise an error.
  """
 
  content_metadata_id = sdk.dashboard(dashboard_id=dashboard_id)['content_metadata_id'] 

  """An admin can not update the list of favorite contents for users, 
  sdk.auth.login_user() and `sdk.auth.logout()` are called to sudo as each user to call `create_content_favorite()"""
  for i in users_id: 
    sdk.auth.login_user(i)
    params = {}
    params["user_id"] = i 
    params["content_metadata_id"] = content_metadata_id
    sdk.create_content_favorite(params)
    sdk.auth.logout() 

  print("Successfully added!")
  
  
 
# Call the functions
add_boards_to_users(board_id = 1, users_id = [1])
add_dashboards_to_users(dashboard_id = "string", users_id = [1])