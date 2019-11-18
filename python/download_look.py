import sys
import textwrap
import time

import exceptions
from looker_sdk import client, models

sdk = client.setup("../looker.ini")


def main():
    """Given a look title, find the corresponding look id and use
    it to render its image.

    $ python download_look.py "A good look" 1024 768 png
    """
    look_title = sys.argv[1] if len(sys.argv) > 1 else ""
    image_width = int(sys.argv[2]) if len(sys.argv) > 2 else 545
    image_height = int(sys.argv[3]) if len(sys.argv) > 3 else 842
    image_format = sys.argv[4] if len(sys.argv) > 4 else "png"

    if not look_title:
        raise exceptions.ArgumentError(
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
        raise exceptions.NotFoundError(f"look '{title}' was not found")
    assert isinstance(look, models.Look)
    return look


def download_look(look: models.Look, result_format: str, width: int, height: int):
    """Download specified look as png/jpg"""
    assert look.id
    id = int(look.id)
    task = sdk.create_look_render_task(id, result_format, width, height,)

    if not (task and task.id):
        raise exceptions.RenderTaskError(
            f"Could not create a render task for '{look.title}'"
        )

    # poll the render task until it completes
    elapsed = 0.0
    delay = 0.5  # wait .5 seconds
    while True:
        poll = sdk.render_task(task.id)
        if poll.status == "failure":
            print(poll)
            raise exceptions.RenderTaskError(f"Render failed for '{look.title}'")
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
