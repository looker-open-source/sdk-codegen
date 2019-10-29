import sys
import time
import textwrap
from typing import Optional

import exceptions
from looker_sdk import client, models

sdk = client.setup("../looker.ini")


def main():
    """Given a dashboard title, search all dashboards to retrieve its id and use
    it to render the dashboard's pdf.

    $ python download_dashboard_pdf.py "A Test Dashboard"
    """
    dashboard_title = sys.argv[1] if len(sys.argv) > 1 else ""
    pdf_style = sys.argv[2] if len(sys.argv) > 2 else "tiled"
    pdf_width = int(sys.argv[3]) if len(sys.argv) > 3 else 545
    pdf_height = int(sys.argv[4]) if len(sys.argv) > 4 else 842

    if not dashboard_title:
        raise exceptions.ArgumentError(
            textwrap.dedent(
                """
                Please provide: <dashboardTitle> [<dashboard_style>] [<pdf_width>] [<pdf_height>]
                    dashboard_style defaults to "tiled"
                    pdf_width defaults to 545
                    pdf_height defaults to 842"""
            )
        )  # noqa: B950

    dashboard = get_dashboard(dashboard_title)
    download_dashboard(dashboard, pdf_style, pdf_width, pdf_height)


def get_dashboard(title: str) -> Optional[models.Dashboard]:
    """Get a dashboard by title."""
    title = title.lower()
    dashboard = next(iter(sdk.search_dashboards(title=title)), None)
    if not dashboard:
        raise exceptions.NotFoundError(f'dashboard "{title}" not found')
    assert isinstance(dashboard, models.Dashboard)
    return dashboard


def download_dashboard(
    dashboard: models.Dashboard, style: str, width: int, height: int
):
    """Download specified dashboard as PDF"""
    assert dashboard.id
    id = int(dashboard.id)
    task = sdk.create_dashboard_render_task(
        id,
        "pdf",
        models.CreateDashboardRenderTask(dashboard_style=style),
        width,
        height,
    )

    if not (task and task.id):
        raise exceptions.RenderTaskError(
            f'Could not create a render task for "{dashboard.title}"'
        )

    # poll the render task until it completes
    elapsed = 0.0
    delay = 0.5  # wait .5 seconds
    while True:
        poll = sdk.render_task(task.id)
        if poll.status == "failure":
            print(poll)
            raise exceptions.RenderTaskError(f'Render failed for "{dashboard.title}"')
        elif poll.status == "success":
            break

        time.sleep(delay)
        elapsed += delay
    print(f"Render task completed in {elapsed} seconds")

    result = sdk.render_task_results(task.id)
    filename = f"{dashboard.title}.pdf"
    with open(filename, "wb") as f:
        f.write(result)
    print(f'Dashboard pdf saved to "{filename}"')


main()
