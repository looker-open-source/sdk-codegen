from functools import reduce
from typing import cast, MutableSequence, Sequence

from looker_sdk import client, methods, models


def main():
    api_client = client.setup("looker.ini")

    connections = get_connections(api_client)

    if not connections:
        print("No connections found.")

    for connection in connections:
        if connection.name == "looker":
            continue
        test_results = run_connection_tests(api_client, connection)
        generate_report(connection.name, test_results)


def get_connections(api_client: methods.LookerSDK) -> Sequence[models.DBConnection]:
    return api_client.all_connections(fields="name, dialect")


def run_connection_tests(
    api_client: methods.LookerSDK, connection: models.DBConnection
) -> Sequence[models.DBConnectionTestResult]:
    assert connection.name
    assert connection.dialect and connection.dialect.connection_tests
    supported_tests: MutableSequence[str] = list(connection.dialect.connection_tests)
    test_results = api_client.test_connection(
        connection.name, models.DelimSequence(supported_tests)
    )
    return test_results


def generate_report(
    connection_name: str, test_results: Sequence[models.DBConnectionTestResult]
):
    errors = list(filter(lambda test: cast(str, test.status) == "error", test_results))
    if errors:
        report = reduce(
            lambda failures, error: failures + f"\n  - {error.message}",
            errors,
            f"{connection_name}:",
        )
    else:
        report = f"{connection_name}: OK"
    print(report)


main()
