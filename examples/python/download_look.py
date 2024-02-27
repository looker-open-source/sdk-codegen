""" Given a look title, search all looks to retrieve its id, render and export the look to png or jpg.

    $ python download_look.py <title> <image_width> <image_height> <image_format>
    img_width defaults to 545, img_height defaults to 842, img_format defaults to png

Examples:
    $ python download_look.py "A simple look"
    $ python download_look.py "A simple look" 545 842 png

Last modified: Feb 27 2024
"""

import sys
import textwrap
import time

import looker_sdk
from looker_sdk import models40 as models

sdk = looker_sdk.init40("../../looker.ini")

def main():
    look_title = sys.argv[1] if len(sys.argv) > 1 else ""
    image_width = int(sys.argv[2]) if len(sys.argv) > 2 else 545
    image_height = int(sys.argv[3]) if len(sys.argv) > 3 else 842
    image_format = sys.argv[4] if len(sys.argv) > 4 else "png"

    if not look_title:
        raise Exception(
            textwrap.dedent(
                """
                Please provide: <lookTitle> [<img_width>] [<img_height>] [<img_format>]
                    img_width defaults to 545
                    img_height defaults to 842
                    img_format defaults to 'png'"""
            )
        )

    look = get_look(look_title)
    download_look(look, image_format, image_width, image_height)


def get_look(title: str) -> models.Look:
    title = title.lower()
    look = next(iter(sdk.search_looks(title=title)), None)
    if not look:
        raise Exception(f"look '{title}' was not found")
    return look


def download_look(look: models.Look, result_format: str, width: int, height: int):
    """Download specified look as png/jpg"""
    id = int(look.id)
    task = sdk.create_look_render_task(id, result_format, width, height,)

    if not (task and task.id):
        raise Exception(
            f"Could not create a render task for '{look.title}'"
        )

    # poll the render task until it completes
    elapsed = 0.0
    delay = 0.5  # wait .5 seconds
    while True:
        poll = sdk.render_task(task.id)
        if poll.status == "failure":
            print(poll)
            raise Exception(f"Render failed for '{look.title}'")
        elif poll.status == "success":
            break
        time.sleep(delay)
        elapsed += delay
    print(f"Render task completed in {elapsed} seconds")

    result = sdk.render_task_results(task.id)
    filename = f"{look.title}.{result_format}"
    with open(filename, "wb") as f:
        f.write(result)
    print(f"Look saved to '{filename}'")


main()
