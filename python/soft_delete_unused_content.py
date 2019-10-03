from typing import Sequence

from looker_sdk import client, models

sdk = client.setup("../looker.ini")


def main() -> None:
    unused_content = find_unused_content()
    if not unused_content:
        print("No unused content")
        return
    soft_delete_content(unused_content)


def find_unused_content() -> Sequence[models.ContentView]:
    """Find content that has had no views."""
    unused_content = sdk.search_content_views(view_count=0)
    return unused_content


def soft_delete_content(unused_content: Sequence[models.ContentView]):
    """Go through unused content and soft delete it.
    """
    for content in unused_content:
        if content.look_id:
            soft_delete_look(content.look_id)
        elif content.dashboard_id:
            soft_delete_dashboard(content.dashboard_id)


def soft_delete_look(id: int):
    """Soft delete looks."""
    sdk.update_look(id, models.WriteLookWithQuery(deleted=True))


def soft_delete_dashboard(id: int):
    """Soft delete dashboards."""
    sdk.update_dashboard(str(id), models.WriteDashboard(deleted=True))


main()

