import csv
import argparse
from looker_sdk import client

"""
The purpose of this script is to parse a CSV file containing a list of emails separated by line breaks. If
the email in the file corresponds to an email in the Looker instance referred to in looker.ini, that user will
be automatically disabled.
"""

sdk = client.setup("looker.ini")


def disable_user(user):
    print("Disabling user " + user.email + " with id " + str(user.id))
    user.is_disabled = True
    sdk.update_user(user_id=user.id, body=user)


def parse_csv():
    f = open(args.filename, 'r', encoding='utf-8-sig') # the encoding may need to be updated depending on your file, see https://stackoverflow.com/a/17912811
    csv_reader = csv.reader(f, delimiter=',')

    for line in csv_reader:
        for user in sdk.search_users(fields="id,email", email=line[0]):
            disable_user(user)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--filename", help="The path to the CSV file containing a list of emails to disable.", required=True)
    args = parser.parse_args()
    parse_csv()
