import looker_sdk
import csv
import exceptions

####Initialize API/SDK for more info go here: https://pypi.org/project/looker-sdk/
from looker_sdk import methods, models40
sdk = looker_sdk.init40("../looker.ini")

#### GO TO ADMIN --> GROUPS AND FIND THE GROUP ID YOU WANT TO ADD THE PEOPLE TO. ADD IT BELOW
### Alternative would be to use the search groups endpoint
### Depending on the cleanliness of your source of emails, you may want to add more error handling
### EG check for structure, add users without Looker accounts to an output file, or even pass them into another endpoint where you create an account. 


def add_csv_of_users_to_group(group_name:str, file_path:str):
    group = sdk.search_groups(name=group_name)
    group = group[0]
    if group:
        data = []
        i=0
        with open(file_path) as f:
            ## MAKE SURE YOU DOUBLE CHECK THE DELIMITER IN YOUR CSV
            reader = csv.reader(f, delimiter=' ')
            for row in reader:
                data.append(str(row[i]))

        ## loops through list and searches user
        ## grabs user id and passes that through add user to group        
        try:
            for email in data:
                for user in sdk.search_users(email=email):
                    #print(user.email)
                    if user.id:
                        sdk.add_group_user(group_id=group.id, body=models40.GroupIdForGroupUserInclusion(user_id= user.id))
                    else:
                        pass

        except KeyError:
            print('Key error \n')
            pass
        except TypeError:
            print('Type error \n')
            pass
        except IndexError:
            print('Index error \n')
            pass
    else:
        print("Group does not exist")
## THE FILE NAME OF THE CSV WILL WORK IF IT IS IN THE SAME DIRECTORY
add_csv_of_users_to_group("GROUPNAME", "test.csv")