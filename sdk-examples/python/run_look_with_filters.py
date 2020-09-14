import json
import sys
from typing import cast, Dict, List, Union

import looker_sdk
from looker_sdk import models, error

import sdk_exceptions

sdk = looker_sdk.init31("../looker.ini")


def main() -> None:
    """Given a look id, obtain the query behind it and run it with the desired
     filter values.

    https://docs.looker.com/reference/api-and-integration/api-reference/v3.1/query#implementation_notes_9  # noqa: B950
    shows an example of how filters are defined in the posted body. To set the
    same filter in this example, the script needs to be run as follows:

    $ python run_look_with_filters.py 5 category.name socks
    """
    look_id = sys.argv[1] if len(sys.argv) > 1 else ""
    filter_args = iter(sys.argv[2:])
    filters: Dict[str, str] = {}

    if not (look_id and len(sys.argv[2:]) > 0 and len(sys.argv[2:]) % 2 == 0):
        raise sdk_exceptions.ArgumentError(
            "Please provide: <lookId> <filter_1> <filter_value_1> "
            "<filter_2> <filter_value_2> ..."
        )

    for filter_name in filter_args:
        filters[filter_name] = next(filter_args)

    query = get_look_query(int(look_id))
    results = run_query_with_filter(query, filters)

    print(f"Query results with filters={filters}:\n{results}", end="\n\n")


def get_look_query(id: int) -> models.Query:
    """Returns the query associated with a given look id."""
    try:
        look = sdk.look(id)
    except error.SDKError:
        raise sdk_exceptions.NotFoundError(f"Error getting Look {id}")
    else:
        query = look.query
        assert isinstance(query, models.Query)
    return query


TJson = List[Dict[str, Union[str, int, float, bool, None]]]


def run_query_with_filter(query: models.Query, filters: Dict[str, str]) -> TJson:
    """Runs the specified query with the specified filters."""
    request = create_query_request(query, filters)
    try:
        json_ = sdk.run_inline_query("json", request, cache=False)
    except error.SDKError:
        raise sdk_exceptions.RunInlineQueryError("Error running query")
    else:
        json_resp = cast(TJson, json.loads(json_))
    return json_resp


def create_query_request(q: models.Query, filters: Dict[str, str]) -> models.WriteQuery:
    return models.WriteQuery(
        model=q.model,
        view=q.view,
        fields=q.fields,
        pivots=q.pivots,
        fill_fields=q.fill_fields,
        filters=filters,
        sorts=q.sorts,
        limit=q.limit,
        column_limit=q.column_limit,
        total=q.total,
        row_total=q.row_total,
        subtotals=q.subtotals,
        dynamic_fields=q.dynamic_fields,
        query_timezone=q.query_timezone,
    )


main()
