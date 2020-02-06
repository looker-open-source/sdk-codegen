from functools import reduce
from typing import cast, MutableSequence, Sequence
import csv
from looker_sdk import client, models

"""
The purpose of this script is to parse a CSV file containing a Role name in the first column
and a Group name in the second column, and update role/group membership accordingly. It will
also remove any individual users assigned to the roles listed in the CSV.

Contents of example roles-groups.csv:
Role 1,Group A
Role 1,Group B
Role 2,Group C
Role 2,Group D
Role 3,Group E
Role 3,Group F

The result of running this script will be that Role 1 will be associated to Group A and Group B,
Role 2 will be associated to Group C and Group D, and Role 3 will be associated to Group E and
Group F. If individual users were associated to these three roles, they will be removed.
"""

sdk = client.setup("looker.ini")
filename = 'roles-groups.csv'
cached_roles = {}


def load_group(group):
    groups = sdk.search_groups(name=group, limit=1)
    if groups:
        return groups[0]


def load_role(role):
    # Don't make a GET /roles/search request for every line
    if role in cached_roles.keys():
        return cached_roles[role]

    roles = sdk.search_roles(name=role, limit=1)
    if roles:
        roles[0].group_ids = []
        cached_roles[role] = roles[0]
        return roles[0]


def main():
    f = open(filename, 'r', encoding='utf-8-sig')
    csv_reader = csv.reader(f, delimiter=',')

    for line in csv_reader:
        print(".", end='')
        role = load_role(line[0])
        group = load_group(line[1])
        if role and group:
            cached_roles[line[0]].group_ids.append(group.id)

    for role in cached_roles:
        sdk.set_role_groups(role_id=cached_roles[role].id, body=cached_roles[role].group_ids)
        sdk.set_role_users(role_id=cached_roles[role].id, body=[])
        print()
        print("Updated '" + role + "' role to remove individual users and associated these group_ids to it instead:")
        print(cached_roles[role].group_ids)


main()
