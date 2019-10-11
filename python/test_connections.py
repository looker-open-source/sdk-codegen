from functools import reduce
from typing import cast, MutableSequence, Sequence

from looker_sdk import client, models


sdk = client.setup("../looker.ini")


def main():
    connections = get_connections()

    if not connections:
        print("No connections found.")

    for connection in connections:
        if connection.name == "looker":
            continue
        test_results = run_connection_tests(connection)
        generate_report(connection.name, test_results)


def get_connections() -> Sequence[models.DBConnection]:
    """Get list of all connections."""
    return sdk.all_connections(fields="name, dialect")


def run_connection_tests(
    connection: models.DBConnection
) -> Sequence[models.DBConnectionTestResult]:
    """Run supported tests against a given connection."""
    assert connection.name
    assert connection.dialect and connection.dialect.connection_tests
    supported_tests: MutableSequence[str] = list(connection.dialect.connection_tests)
    test_results = sdk.test_connection(
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
