import looker_sdk
import logging
import argparse
from looker_sdk import models
import pandas as pd


'''
Background: https://github.com/github/renaming
Github has changed their default name for production branches from master to main. 
While master will still work to have a cohesive and consistent naming pattern this script
will update existing Looker Projects' production branch to main. Running this with the default
args will create a list of projects that do not use main as the production branch name. 
With the --update flag, you can programmatically change these to main. 
With the --omit flag, you can avoid making these changes on specific projects. 
'''


def initialize_sdk():
    '''
    This assumes there is a looker.ini file in the same directory as the script. 
    If in other directory, please specify the path
    '''
    sdk = looker_sdk.init40()
    return sdk


def get_all_prod_branches(sdk, omit):
    '''
    This function loops through all projects in Looker. 
    It checks if the project does not use main as the production branch.
    This also removes any bare repos from the list since they do not use git.
    The result of this is a tuple of project names, branches, and remote repos.
    It also writes a csv of the projects, remote urls and production branch names 
    that do not use main and are not bare repos. 
    ARGS: omit, sdk
    SDK is the result of initializing the python sdk.
    Omit is the result  of the --omit flag, It accepts a comma separate listed of 
    project names and will not update them. 
    '''
    omit = omit
    # nonetype handling
    if omit:
        omit = omit
    else:
        omit = []
    target_projects = []
    target_branches = []
    safe_list = []
    bare_repos = []
    remotes = []
    projects = sdk.all_projects()
    string = "bare"
    for project in projects:
        if project.name in omit:
            safe_list.append(project.name)
        else:
            if project.git_production_branch_name != "main":
                url = project.git_remote_url
                if string in str(url):
                    logging.info(
                        project.name + " uses a bare repo and was removed from the list."
                        )
                    bare_repos.append(url)
                else:
                    target_projects.append(project.name)
                    target_branches.append(project.git_production_branch_name)
                    remotes.append(project.git_remote_url)

    df = pd.DataFrame(list(zip(target_projects, target_branches, remotes)), columns=["Projects", "Branches", "Remotes"])
    df.to_csv('git_branches.csv')
    return target_projects, target_branches, remotes


def update_prod_branch(update, branches, sdk):
    '''
    This function takes the projects that are not set to use main as the production 
    branch and update them to use main.
    ARGS: update, branches, sdk
    Update is from the --update flag. If not used this script just lists the projects 
    that do not use main.
    If update is used, it will change the production branch to main if not outlined 
    on the omit list. 
    sdk is the result of initializing the python sdk.
    The args for this function are passed from the result of get_all_prod_branches.
    '''
    if update:
        target_projects = branches[0]
        for p in target_projects:
            sdk.update_project(project_id=p, body=models.WriteProject(git_production_branch_name="main"))
            logging.info(p + " was updated to main")
         


def main():
    '''
    This calls get prod branches and passes the result of that into update_prod_branches.
    This also logs the changes to an out file in the local directory called update_git_branch_script.log
    ARGS: None
    '''
    parser = argparse.ArgumentParser(
        description='Identify projects that do not use main as their production branch and update these')
    parser.add_argument('--update', '-u', action="store_true",
                        help='Update branches to all use main')
    parser.add_argument('--omit', '-o', type=str,
                        help='List of projects we want to omit')
    args = parser.parse_args()
    update = args.update
    omit = args.omit
    logging.basicConfig(filename='update_git_branch_script.log', level=logging.INFO)

    sdk = initialize_sdk()
    branches = get_all_prod_branches(sdk, omit)
    update_prod_branch(update, branches, sdk)
if __name__ == "__main__":
    main()
