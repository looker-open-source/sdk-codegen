import sys
import textwrap
import time
from typing import List

import looker_sdk
from looker_sdk import models40 as models

import sdk_exceptions

sdk = looker_sdk.init40("../../looker.ini")


def main_models(model: str, view: str, fields: List[str]) -> str:
    """QueryTask logic implemented using model class instances."""

    print("Running model class instance form of SDK")
    query = sdk.create_query(
        body=models.WriteQuery(model=model, view=view, fields=fields)
    )
    # WriteCreateQueryTask.result_format is an enum
    assert query.id
    create_query_task = models.WriteCreateQueryTask(
        query_id=query.id, result_format=models.ResultFormat.csv
    )
    task = sdk.create_query_task(
        body=create_query_task,
        limit=10,
    )
    elapsed = 0.0
    delay = 0.5  # wait .5 seconds
    while True:
        assert task.id
        poll = sdk.query_task(query_task_id=task.id)
        if poll.status == "failure" or poll.status == "error":
            print(poll)
            raise sdk_exceptions.RenderTaskError("Query failed")
        elif poll.status == "complete":
            break
        time.sleep(delay)
        elapsed += delay
    print(f"query task completed in {elapsed} seconds")

    return sdk.query_task_results(task.id)


def main_dictionaries(model, view, fields):
    """QueryTask logic implemented using dictionaries."""

    # Note - dictionary form does not adhere to the type safety in place
    # for the SDK. Here you will see the following mypy error:
    #
    # Error: mypy: Argument "body" to "create_query" of "Looker40SDK" has
    # incompatible type "Dict[str, Any]"; expected "WriteQuery"
    #
    # As long as you are respecting what the API can take as input you should
    # be fine. However, the SDK will send whatever you provide, including
    # extraneous input and give you back whatever the API server replies with.
    print("Running dictionary form of SDK")
    query = sdk.create_query(
        body={"model": model, "view": view, "fields": fields}  # type: ignore
    )
    # In dictionary form "result_format" key is just a string, not an enum.
    task = sdk.create_query_task(
        body={"query_id": query["id"], "result_format": "csv"},  # type: ignore
        limit=10,
    )
    elapsed = 0.0
    delay = 0.5  # wait .5 seconds
    while True:
        poll = sdk.query_task(query_task_id=task["id"])
        if poll["status"] == "error":
            print(poll)
            raise sdk_exceptions.RenderTaskError("Query failed")
        elif poll["status"] == "complete":
            break
        time.sleep(delay)
        elapsed += delay
    print(f"query task completed in {elapsed} seconds")

    return sdk.query_task_results(task["id"])


def main():
    """Given a model, view, and fields create a query, and then a query task
    to asynchronously execute.

    $ python query_task.py thelook users users.first_name [users.last_name users.email ...]
    """
    model = sys.argv[1] if len(sys.argv) > 1 else ""
    view = sys.argv[1] if len(sys.argv) > 1 else ""
    try:
        model, view, *fields = sys.argv[1:]
    except ValueError:
        raise sdk_exceptions.ArgumentError(
            textwrap.dedent(
                """
                Please provide: <model> <view> <field1> [<field2> ...]
                """
            )
        )

    result = main_models(model, view, fields)
    # an alternate implementation using dictionaries
    # result = main_dictionaries(model, view, fields)

    filename = f"{model}--{view}--{('-').join(fields)}"
    with open(filename, "w") as f:
        f.write(result)
    print(f"Look saved to '{filename}'")


if __name__ == "__main__":
    sys.exit(main())
