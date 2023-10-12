from looker_sdk.sdk.api40.models import WriteDashboardElement, Query

import looker_sdk

sdk = looker_sdk.init40()


def update_explores_in_dashboards(
    dashboard_ids: List[str],
    old_explore_name: str,
    old_model_name: str,
    new_explore_name: str,
    new_model_name: str,
):
    for dashboard_id in dashboard_ids:
        dashboard_elements = sdk.dashboard_dashboard_elements(dashboard_id=dashboard_id)
        dashboard_element_ids = {
            dashboard_element.id: dashboard_element.query.id
            for dashboard_element in dashboard_elements
            if dashboard_element.query
        }
        for dashboard_element_id, query_id in dashboard_element_ids.items():
            query_response = sdk.query(query_id=query_id)
            query_response = query_response.__dict__
            if (
                query_response["model"] == old_model_name
                and query_response["model"] == old_explore_name
            ):
                update_dict = {"model": new_model_name, "view": new_explore_name}
                query_response.update(update_dict)
                del query_response["id"]
                del query_response["client_id"]
                new_query = sdk.create_query(query_response)
                sdk.update_dashboard_element(
                    dashboard_element_id=dashboard_element_id,
                    body=WriteDashboardElement(query_id=new_query.id),
                )


def main():
    dashboard_ids = ["1"]
    old_model_name = "old_model_name"
    old_explore_name = "old_explore_name"
    new_model_name = "new_model_name"
    new_explore_name = "new_explore_name"
    update_explores_in_dashboards(
        dashboard_ids=dashboard_ids,
        old_model_name=old_model_name,
        old_explore_name=old_explore_name,
        new_model_name=new_model_name,
        new_explore_name=new_explore_name,
    )

main()
