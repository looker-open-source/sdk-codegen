# Initialize API/SDK for more info go here: https://pypi.org/project/looker-sdk/
import looker_sdk
from looker_sdk import models
from looker_sdk.sdk.api40.models import DashboardElement, DashboardFilter

sdk = looker_sdk.init40("looker.ini")

def main():
    """This file creates a new dashboard filter, and applies that filtering to all tiles on the dashboard.
    Dashboard elements listen on the same field that the dashboard filter is created from.
    This example can be modified to create a filter on many dashboards at once if you've added a new field to your LookML,
        dynamically generate dashboards, etc.
    """
    
    # Update these with the relevant information for the filter you want to create, and the dashboard
    dash_id = '<dashboard_id>'
    filter_name = '<name_of_filter>'
    filter_model = '<model_name>'
    filter_explore = '<explore_name>'
    filter_dimension = '<view_name.field_name>' # Requires a fully-scoped dimension
 
    filter = create_filter(dash_id, filter_name, filter_model, filter_explore, filter_dimension)
    elements = sdk.dashboard_dashboard_elements(dash_id)
    for element in elements:
        # Skip elements that are text tiles
        # Add other restrictions here to skip updating individual tiles
        if element.type != 'text':
            update_elements_filters(element, filter)

def create_filter(dash_id: str, filter_name: str, filter_model: str, filter_explore: str , filter_dimension: str ) -> DashboardFilter:
    """Creates a dashboard filter object on the specified dashboard. Filters must be tied to a specific LookML Dimension.

    Args:
        dash_id (str): ID of the dashboard to create the filter on
        name (str): Name/Title of the filter
        model (str): Model of the dimension
        explore (str): Explore of the dimension
        dimension (str): Name of the dimension. Must be in the format 'view_name.field_name'
    """

    return sdk.create_dashboard_filter(
        body=models.WriteCreateDashboardFilter(
            dashboard_id=dash_id,
            name=filter_name,
            title=filter_name,
            type='field_filter', # New dashboards are only compatible with field filters
            model=filter_model,
            explore=filter_explore,
            dimension=filter_dimension,
            # Add additional parameters as necessary for allowing multiple values, ui configuration, etc.
            )
        )

def update_elements_filters(element: DashboardElement, filter: DashboardFilter) -> None:
    """Updates a dashboard element's result maker to include a listener on the new dashboard filter.


    Args:
        element (DashboardElement): Dashboard element to update with the new filter
        filter (DashboardFilter): Dashboard filter the element will listen to
    """
    # Keep track of the current result_maker and add to it, otherwise listeners for other filters would be removed
    current_filterables = element.result_maker.filterables
    element.result_maker.filterables = []
    for filterable in current_filterables:
        new_listens = filterable.listen

        # Add listener for new filter, if model and explore is the same
        # You can easily add further restrictions to what tiles or queries within merged results will listen to the new tile
        # If you don't want to restrict what tiles or queries this listen to this filter, just remove this if
        if filter.model == filterable.model and filter.explore == filterable.view:
            new_listens.append(models.ResultMakerFilterablesListen(dashboard_filter_name=filter.name, field=filter.dimension))
            filterable.listen = new_listens
        # Append the new filterables to a result maker that we can use for the dashboard element
        element.result_maker.filterables.append(
                models.ResultMakerFilterables(
                model=filterable.model,
                view=filterable.view,
                listen=new_listens,
                )
            )
    
    # Update element with the new result maker that listens to new filter
    sdk.update_dashboard_element(dashboard_element_id = element.id, body = models.WriteDashboardElement(result_maker = element.result_maker))

if __name__ == "__main__":
    main()
