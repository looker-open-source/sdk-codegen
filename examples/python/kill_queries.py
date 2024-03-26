""" 
This script demonstrates examples with canceling queries using Python SDK 

Example:
    Kill all running queries in a Looker instance, or kill queries selectively with optional arguments ('user_id' and 'source') 
    	Usecase:  Running an excessive amount of queries simultaneously may lead to degraded Looker instance performance, especially queries run 
    	by an API user to send out schedules or queries requiring post-processing features (such as merged results, custom fields, and table calculations).
    	In these situations, the fastest way to bring an instance back to a normal stage is to kill all running qeuries to help with restoring CPU and memory.  

Authors: Lan

Last modified: Feb 27 2024
"""

import looker_sdk
sdk = looker_sdk.init40(config_file='../looker.ini', section='Looker')


def kill_queries(user_id=None, source=None):

  """Kill running queries in an instance.
  
  Args:
  user_id(int): id of the user whose queries are to be killed 
  source(str): common values are 'merge_query', 'explore', 'dashboard', 'look', 'regenerator'  
  """

  queries = sdk.all_running_queries()

  if len(queries) == 0:
    print('Currently, there is no running query in the instance')
    
  else:
    for i in range(0, len(queries)):   
        if queries[i]['source'] == source or queries[i]['user']['id'] == user_id: 
          sdk.kill_query(queries[i]['query_task_id'])
          print('Killed query task id' + queries[i]['query_task_id'])

        else:
          print('Currently, there are no running queries that meet the conditions')
