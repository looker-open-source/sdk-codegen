import sys
from typing import Sequence

import exceptions
from looker_sdk import client, error, models


sdk = client.setup("../looker.ini")


def main():
    """Given a dashboard title, get the ids of all dashboards with matching titles
    and move them to trash.

    $ python soft_delete_dashboard.py "An Unused Dashboard"
    """

    dashboard_title = sys.argv[1] if len(sys.argv) > 1 else ""

    if not dashboard_title:
        raise exceptions.ArgumentError("Please provide: <dashboardTitle>")

    dashboards = get_dashboards(dashboard_title)
    delete_dashboards(dashboards)


def get_dashboards(title: str) -> Sequence[models.Dashboard]:
    """Get dashboards with matching title"""
    lc_title = title.lower()
    results = sdk.search_dashboards(title=lc_title)
    if not results:
        raise exceptions.NotFoundError(f'dashboard "{title}" not found')
    assert isinstance(results, Sequence)
    return results


def delete_dashboards(dashboards: Sequence[models.Dashboard]):
    """Soft delete dashboards"""
    for dashboard in dashboards:
        try:
            assert dashboard.id
            sdk.delete_dashboard(dashboard.id)
        except error.SDKError:
            print(f"Failed to delete dashboard with id {dashboard.id}.")
        else:
            print(f'"{dashboard.title}" (id {dashboard.id}) has been moved to trash.')


main()
