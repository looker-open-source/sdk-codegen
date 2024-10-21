""" Given a dashboard id, download each of its tiles as csv files

    $ python download_dashboard_csv.py <dashboard_id>
    Note: dashboard_id is required

Example:
    $ python download_dashboard_csv.py 1234
"""

import os
import time
import sys
import textwrap
from typing import Sequence
from looker_sdk.sdk.api40.models import (
    DashboardElement,
    WriteCreateQueryTask,
    ResultFormat,
)

import looker_sdk

sdk = looker_sdk.init40("../../looker.ini")


def main():
    dashboard_id = sys.argv[1] if len(sys.argv) > 1 else ""

    if not dashboard_id:
        raise Exception(
            textwrap.dedent(
                """
                Please provide: <dashboard_id>"""
            )
        )

    download_dashboard_csv(dashboard_id)


def get_all_dashboard_elements(dashboard_id: str) -> Sequence[DashboardElement]:
    """Get all dashboard elements by dashboard id."""
    elements = sdk.dashboard_dashboard_elements(dashboard_id, fields="query")
    if len(elements) == 0:
        raise Exception(f'Dashboard "{dashboard_id}" not found')
    return elements


def save_data_to_csv(data: str, folder: str, filename: str):
    with open(os.path.join(folder, f"{filename}.csv"), "w") as f:
        f.write(data)


def create_folder(folder_name):
    if not os.path.exists(folder_name):
        os.mkdir(folder_name)
    return os.path.join(os.getcwd(), folder_name)


def download_dashboard_csv(dashboard_id: str):
    elements = sdk.dashboard_dashboard_elements(dashboard_id, fields="query")

    query_tasks_ids = []

    # Create Async Query Task for each element of the dashboard
    for element in elements:
        if not element.query or not element.query.id:
            continue

        query_id = element.query.id
        body = WriteCreateQueryTask(
            query_id=query_id, result_format=ResultFormat("csv")
        )

        query_task = sdk.create_query_task(
            body=body,
        )

        if query_task.id:
            query_tasks_ids.append(query_task.id)

    completed_async_tasks = []

    create_folder(dashboard_id)

    # Do a polling for completed Query Tasks
    # Any Query Task that completes is downloaded and saved to CSV
    # Polling will be triggered every second. Will stop after 1 min
    retries = 60
    while (len(query_tasks_ids) > 0 or len(completed_async_tasks) > 0) and retries > 0:
        # Get status for each task_id and move to completed list if "complete"
        for task_id in query_tasks_ids.copy():
            query_task_info = sdk.query_task(task_id)
            status = query_task_info.status

            if status == "complete":
                completed_async_tasks.append(task_id)
                query_tasks_ids.remove(task_id)
            elif status == "error":
                print(f"Query Task {task_id} failed with an error")
                return

        # Download results for all completed pending tasks and write to csv per task
        for completed_task_id in completed_async_tasks.copy():
            results = sdk.query_task_results(completed_task_id)
            save_data_to_csv(results, dashboard_id, completed_task_id)
            completed_async_tasks.remove(completed_task_id)

        if len(query_tasks_ids) > 0 or len(completed_async_tasks) > 0:
            retries -= 1
            time.sleep(1)

    print("Process complete")


main()
