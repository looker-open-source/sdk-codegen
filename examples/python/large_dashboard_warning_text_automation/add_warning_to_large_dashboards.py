import looker_sdk
from looker_sdk import models40
import json

sdk = looker_sdk.init40()


def main():
    large_dashboard_id_list = get_large_dashboard_id_list()

    for dashboard_id in large_dashboard_id_list:
        add_warning_text_tile(dashboard_id)

    print("Large dashboard warning automation complete.")


def get_large_dashboard_id_list():
    large_dashboards_query = models40.WriteQuery(
        model="system__activity",
        view="dashboard",
        fields=[
            "dashboard.id",
            "dashboard.title",
            "dashboard_element.count",
            "dashboard_element.count_text",
            "query.count",
        ],
        pivots=None,
        fill_fields=None,
        filters={
            "dashboard_element.count": ">25",
            "dashboard.deleted_date": "NULL",
            "dashboard.moved_to_trash": "No",
        },
        filter_expression=None,
        sorts=["query.count desc"],
        limit="5000",
    )

    get_large_dashboards_query = sdk.create_query(body=large_dashboards_query)

    large_dashboards_query_results = json.loads(
        sdk.run_query(
            query_id=get_large_dashboards_query.id, result_format="json", cache=True
        )
    )

    large_dashboards_id_list = [
        str(dashboard["dashboard.id"]) for dashboard in large_dashboards_query_results
    ]

    return large_dashboards_id_list


def add_warning_text_tile(dashboard_id: str):
    write_warning_text_element = models40.WriteDashboardElement(
        body_text='<div style="font-size: 18px;"> <b> There are more than 25 tiles on this dashboard. Please reduce the number of tiles to <= 25.</b> </div> <br> <br>Note, this warning was programmatically triggered. Reach out to help_me@company.com for more information.',
        dashboard_id=dashboard_id,
        title_text="<mark> <img src='https://img.icons8.com/?size=512&id=5tH5sHqq0t2q&format=png' height='30'> <b> Warning </b> <img src='https://img.icons8.com/?size=512&id=5tH5sHqq0t2q&format=png' height='30'> </mark>",
        type="text",
    )

    create_warning_text_element = sdk.create_dashboard_element(
        body=write_warning_text_element, apply_filters=False
    )

    warning_text_element_id = create_warning_text_element.id

    # Grab dashboard metadata (layout and components)
    dashboard_metadata = sdk.dashboard(
        dashboard_id=dashboard_id, fields="dashboard_layouts"
    )

    dashboard_layout_id = dashboard_metadata["dashboard_layouts"][0]["id"]

    dashboard_layout = sdk.dashboard_layout(dashboard_layout_id=dashboard_layout_id)

    dashboard_layout_components = dashboard_layout["dashboard_layout_components"]

    warning_text_tile_layout_component_id = dashboard_layout_components[-1].id

    # Update dashboard layout and move warning text tile to top of dashboard. Requires looping through each tile and updating its location.
    for idx, tile in enumerate(dashboard_layout_components):
        # Move warning text tile to top of dashboard
        if idx == len(dashboard_layout_components) - 1:
            new_dashboard_layout_components_warning_text_tile = (
                models40.WriteDashboardLayoutComponent(
                    dashboard_layout_id=dashboard_layout_id,
                    dashboard_element_id=warning_text_element_id,
                    row=0,
                    column=0,
                    width=12,
                    height=6,
                )
            )

            sdk.update_dashboard_layout_component(
                dashboard_layout_component_id=warning_text_tile_layout_component_id,
                body=new_dashboard_layout_components_warning_text_tile,
            )

        # Move all other tiles down in dashboard
        else:
            row = tile.row
            column = tile.column
            width = tile.width
            height = tile.height
            row += 6

            new_dashboard_layout_components = models40.WriteDashboardLayoutComponent(
                dashboard_layout_id=dashboard_layout_id,
                dashboard_element_id=tile.dashboard_element_id,
                row=row,
                column=column,
                width=width,
                height=height,
            )

            sdk.update_dashboard_layout_component(
                dashboard_layout_component_id=tile.id,
                body=new_dashboard_layout_components,
            )

    print(f"Warning text tile added to dashboard ID: {dashboard_id}")
