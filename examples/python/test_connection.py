from functools import reduce
import sys
from typing import cast, MutableSequence, Sequence

import looker_sdk
from looker_sdk import models

import sdk_exceptions

sdk = looker_sdk.init31("../../looker.ini")


def main():
    """Given a connection, obtain its supported tests and run them. Example:

    $ python test_connection.py thelook
    """
    connection_name = sys.argv[1] if len(sys.argv) > 1 else ""

    if not connection_name:
        raise sdk_exceptions.ArgumentError("Please provide a connection name")
    elif connection_name in ["looker", "looker__internal__analytics"]:
        raise sdk_exceptions.ArgumentError(
            f"Connection '{connection_name}' is internal and cannot be tested."
        )

    connection = get_connections(connection_name)

    results = test_connection(connection)

    output_results(cast(str, connection.name), results)


def get_connections(name: str) -> models.DBConnection:
    connection = sdk.connection(name, fields="name, dialect")
    return connection


def test_connection(
    connection: models.DBConnection,
) -> Sequence[models.DBConnectionTestResult]:
    """Run supported tests against a given connection."""
    assert connection.name
    assert connection.dialect and connection.dialect.connection_tests
    supported_tests: MutableSequence[str] = list(connection.dialect.connection_tests)
    test_results = sdk.test_connection(
        connection.name, models.DelimSequence(supported_tests)
    )
    return test_results


def output_results(
    connection_name: str, test_results: Sequence[models.DBConnectionTestResult]
):
    """Prints connection test results."""
    errors = list(filter(lambda test: cast(str, test.status) == "error", test_results))
    if errors:
        report = reduce(
            lambda failures, error: failures + f"\n  - {error.message}",
            errors,
            f"{connection_name}:",
        )
    else:
        report = f"All tests for connection '{connection_name}' were successful."
    print(report)


main()
