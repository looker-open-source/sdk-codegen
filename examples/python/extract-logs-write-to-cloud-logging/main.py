import json
from collections import defaultdict

import looker_sdk
from looker_sdk import models40 as models

from google.cloud import logging

sdk = looker_sdk.init40()


def create_query():
    response = sdk.create_query(
        body=models.WriteQuery(
            model="system__activity",
            view="event_attribute",
            fields=[
                "event.category",
                "event.created_time",
                "event.id",
                "event.name",
                "event.sudo_user_id",
                "event_attribute.id",
                "event_attribute.name",
                "event_attribute.value",
                "group.external_group_id",
                "group.id",
                "group.name",
                "model_set.id",
                "model_set.models",
                "model_set.name",
                "permission_set.id",
                "permission_set.name",
                "permission_set.permissions",
                "user.dev_branch_name",
                "user.email",
                "user.name"
            ],
            filters={"event.created_time": "10 minutes"},
            sorts=["event.created_time desc"]
        ))

    return response


def get_looker_data():
    query_id = create_query()["id"]
    response = sdk.run_query(
        query_id=query_id,
        result_format="json")
    return json.loads(response)


def group_permission_by_event_id(data):
    output = defaultdict(set)
    for r in data:
        event_id = r['event.id']
        permission_data = json.dumps({
            'permission_set_id': r['permission_set.id'],
            'permission_set_name': r['permission_set.name'],
            'permission_set_permissions': r['permission_set.permissions'],
        })
        output[event_id].add(permission_data)
    return output


def group_event_attribute_by_event_id(data):
    output = defaultdict(set)
    for r in data:
        event_id = r['event.id']
        event_attribute_data = json.dumps({
            'event_attribute_id': r['event_attribute.id'],
            'event_attribute_name': r['event_attribute.name'],
            'event_attribute_value': r['event_attribute.value'],
        })
        output[event_id].add(event_attribute_data)
    return output


def group_model_set_by_event_id(data):
    output = defaultdict(set)
    for r in data:
        event_id = r['event.id']
        model_set_data = json.dumps({
            'model_set_id': r['model_set.id'],
            'model_set_name': r['model_set.id'],
            'model_set_models': r['model_set.id'],
        })
        output[event_id].add(model_set_data)
    return output


def group_user_by_event_id(data):
    output = defaultdict(set)
    for r in data:
        event_id = r['event.id']
        user_data = json.dumps({
            'user_email': r['user.email'],
            'user_name': r['user.name'],
            'user_dev_branch_name': r['user.dev_branch_name'],
        })
        output[event_id].add(user_data)
    return output


def group_event_by_event_id(data):
    output = defaultdict(set)
    for r in data:
        event_id = r['event.id']
        user_data = json.dumps({
            'event_category': r['event.category'],
            'event_name': r['event.name'],
            'event_id': r['event.id'],
            'event_created_time': r['event.created_time'],
            'event_sudo_user_id': r['event.sudo_user_id'],
        })
        output[event_id].add(user_data)
    return output


def group_all(data):
    user = group_user_by_event_id(data)
    model_set = group_model_set_by_event_id(data)
    event_attribute = group_event_attribute_by_event_id(data)
    permission = group_permission_by_event_id(data)
    event = group_event_by_event_id(data)

    event_id_set = set()

    for r in data:
        event_id_set.add(r['event.id'])

    output = {}
    for id in event_id_set:
        output[id] = {
            'event': list(event[id]),
            'permission_set': list(permission[id]),
            'event_attribute': list(event_attribute[id]),
            'user': list(user[id]),
            'model_set': list(model_set[id]),
        }
    return output


def parse_event_attribute(event_attribute):
    output = {}
    for data in event_attribute:
        r = json.loads(data)
        output[r['event_attribute_name']] = r['event_attribute_value']
    return output


def get_status(data):
    ea = parse_event_attribute(data)
    if 'status' in ea:
        return ea['status']
    return ''


def format(aggregated_data):
    data = aggregated_data
    output = []

    for id in aggregated_data:

        output.append({
            'logName': 'looker_system_activity_logs',
            'timestamp': json.loads(data[id]['event'][0])['event_created_time'],
            'insertId': id,
            'resource': {
                'type': 'looker',
            },
            'protoPayload': {
                '@type': 'looker_system_activity_logs',
                'authenticationInfo': {
                    'principalEmail': json.loads(data[id]['user'][0])['user_email']
                },
                'serviceName': 'looker.com',
                'methodName': json.loads(data[id]['event'][0])['event_name'],
                'details': parse_event_attribute(data[id]['event_attribute']),
                'status': get_status(data[id]['event_attribute']),
            }
        })

    return output


def write_log_entry(formatted_data):

    logging_client = logging.Client()
    logger = logging_client.logger('looker_system_activity_logs')

    for log in formatted_data:
        logger.log_struct(log)

    print("Wrote logs to {}.".format(logger.name))


if __name__ == "__main__":
    data = get_looker_data()
    agg_data = group_all(data)
    formatted_data = format(agg_data)
    write_log_entry(formatted_data)
