""" 
This script demonstrates examples with configuring Looker Schedule Plans using Python SDK 

Example:
    Pause/Resume all schedules of a Look or a Dashboard: 
    	Usecase: Admins want to temporarily bulk-pausing all schedules when there are changes in ETL or LookML projects
    	that would lead to errors in sending schedules. Currently, there is no option in Looker UI to bulk-disable/enable schedules
    Copy all schedule settings of a Look (or a Dashboard) to another Look (or a Dashboard)
    	Usecase: Admins want to copy all schedule settings (destination plans, recipients, result options, etc.) of a Look or 
    	a Dashboard to another Look or Dashboard. Currently, there is no option in Looker UI to "copy" all schedules. 

Authors: Lan

Last modified: Feb 27 2024
"""

import looker_sdk
from looker_sdk import models40 as models
sdk = looker_sdk.init40(config_file='../looker.ini', section='Looker')


def get_schedules(id, content, user_id=None, all_users=True):
  
  """ Get all schedule plans of a Looker content owned by user_id
  
  Args: 
    id: id of the Looker content containing schedules    
    content(str): 'look', 'dashboard', or 'lookml_dashboard'
    user_id(int, optional): If user_id is None then return schedules owned by the user calling the API 
    all_users(bool, optional): If all_user is True then return schedules owned by all users 
  """

  if content == 'look':
    schedules = sdk.scheduled_plans_for_look(id, user_id=user_id, all_users=all_users)
  elif content == 'dashboard':
    schedules = sdk.scheduled_plans_for_dashboard(id, user_id=user_id, all_users=all_users)
  elif content == 'lookml_dashboard':
    schedules = sdk.schedule_plans_for_lookml_dashboard(id, user_id=user_id, all_users=all_users)
  return schedules


  def resume_schedules(id, content, enabled, user_id=None, all_users=True):

    """ Pause or resume all schedules of a Look, or a dashboard
    
    Args: 
      id: id of the Looker content containing schedules    
      content(str): 'look', 'dashboard', or 'lookml_dashboard'
      enabled (bool): set "True" to resume schedule, or "False" to pause schedule
    
    Notes: Schedules with "enabled = False" will disappear from Admin > Schedules in Looker UI but 
    their data can be retrived in Looker's System Activity. Once schedules are resumed with "enabled = True", 
    they will be sent once and reappear in Admin > Schedules  
    """

  "Get all schedules of a Looker content"
  schedules = get_schedules(id=id, content=content)
    
  for i in range(0, len(schedules)):
    sdk.update_scheduled_plan(
    scheduled_plan_id=schedules[i]['id'],
    body=models.WriteScheduledPlan(
        enabled = enabled
    ))

  string = "Successfully set all schedules of {content} id {id} to enabled={enabled}".format(content=content, id =id, enabled=enabled)
  print(string)



  def copy_schedules(from_id, to_id, content, user_id=None, all_users=True):

    """ Copy schedules from one Looker content to another content.
    This script has only been tested for content of the same type (i.e.: look to look, dashboard to dashboard)

    Args: 
      from_id: id of the Looker content containing schedules    
      to_id: id of the Looker content which schedules will be copied to
      content(str): 'look', 'dashboard', or 'lookml_dashboard'
      user_id(int, optional): If user_id is None then schedules owned by the user calling the API will be returned
      all_users(bool, optional): If all_user is True then return schedules owned by all users 
    """

  "Get all schedules of a Looker content"
  schedules = get_schedules(id=from_id, content=content, user_id=user_id, all_users=all_users)


  for i in range(0, len(schedules)):

    # Write the base schedule plans with all required fields
    body = models.WriteScheduledPlan(

          # Required fields for all content type 
          name = schedules[i]['name'],
          crontab = schedules[i]['crontab'],
          datagroup = schedules[i]['datagroup'],
          scheduled_plan_destination = schedules[i]['scheduled_plan_destination'],
          
          # Additional required fields for content type Look
          require_no_results = schedules[i]['require_no_results'],
          require_change = schedules[i]['require_change'],
          require_results = schedules[i]['require_no_results']       
      )
    
    # Additional required field for each content type
    if content == 'look':
      body['look_id'] = to_id
    elif content == 'dashboard':
      body['dashboard_id'] = to_id
    elif content == 'lookml_dashboard':
      body['lookml_dashboard_id'] = to_id

    """Additional parameters can be added in the models.WriteScheduledPlan() method for 'body',
    or through Python's dictionary syntax: body[parameter] = value """


    #Create new schedule plans
    sdk.create_scheduled_plan(body=body)

  string = "Successfully copy schedules of {content} id {from_id} to {content} id {to_id}".format(content=content, from_id=from_id, to_id=to_id)
  print(string)
