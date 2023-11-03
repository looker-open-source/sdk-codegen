# Python Examples for the Looker API

You can find Python language examples in this folder. 

The full details of all Looker API endpoints are listed in Looker Docs: [Version 3.1](https://docs.looker.com/reference/api-and-integration/api-reference/v3.1), [Version 4.0](https://docs.looker.com/reference/api-and-integration/api-reference/v4.0)

## Full Applications

- [Flask full app demo](lookersdk-flask)
- [Google Cloud Function & Google Sheet : Create new users from reading email addresses in a Google Sheet](cloud-function-user-provision)
- [Google Cloud Function & BigQuery: Run a query in Looker, and write the result to a BigQuery table](cloud-function-write-to-bigquery)
- [Google Cloud Function, Cloud Scheduler, & GCS: Automate the Looker content cleanup process](cloud-function-content-cleanup-automation)

## Connection : Manage Database Connections

- [Test a specified connection](test_connection.py)

## Content : Manage Content

- [Add a board or dashboard to Favorites for a list of users](add_contents_to_favorite.py)
- [Output permission access for folders](folder_permission_access.py)

## Dashboard : Manage Dashboards

- [Soft delete dashboard](soft_delete_dashboard.py)

## Query : Run and Manage Queries
- [Kill all running queries](kill_queries.py)

## RenderTask : Manage Render Tasks

- [Download dashboard tile in specified format](download_tile.py)
- [Download look in specified format](download_look.py)
- [Generate and download dashboard PDFs](download_dashboard_pdf.py)

## ScheduledPlan : Manage Scheduled Plans

- [Transfer all schedules of a user to another user](transfer_all_schedules.py)
- [Pause/Resume or Copy Schedules](manage_schedules.py)
- [Create a Simple Schedule Plan](simple_schedule_plan.py)

## User : Manage Users

- [Disable all active user sessions](logout_all_users.py)
- [Add a list of users to a group from a CSV](add_users_to_group_from_csv.py)

## Project : Manage Projects
- [Update projects to use main as the production branch](update_prod_branches_to_main.py)
- [Google Cloud Function: User Creation](cloud-function-user-provision)
