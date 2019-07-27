"""Types and abstract base class for transport implementations.
"""
from __future__ import annotations

import abc
import dataclasses
import enum
from typing import (AnyStr, Callable, Dict, IO, MutableMapping, Optional,
                    Union)

# pylint: disable=too-few-public-methods


class HttpMethod(enum.Enum):
    """Supported HTTP verbs.
    """
    GET = 1
    POST = 2
    PUT = 3
    DELETE = 4
    PATCH = 5
    TRACE = 6
    HEAD = 7


@dataclasses.dataclass(frozen=True)
class TransportSettings:
    """Basic transport settings.
    """
    base_url: str
    api_version: str
    headers: Optional[MutableMapping[str, str]] = None


TResponseValue = Union[str, bytes]


@dataclasses.dataclass(frozen=True)
class Response:
    """Success Response object.
    """
    ok: bool
    value: TResponseValue


class Transport(abc.ABC):
    """Transport base class.
    """
    @classmethod
    @abc.abstractmethod
    def configure(cls, settings: TransportSettings) -> Transport:
        """Configure and return an instance of Transport
        """

    # pylint: disable=too-many-arguments
    @abc.abstractmethod
    def request(self,
                method: HttpMethod,
                path: str,
                query_params: Optional[MutableMapping[str, str]] = None,
                body: Optional[
                    Union[bytes, MutableMapping[str, str], IO[AnyStr]]] = None,
                authenticator: Optional[Callable[[], Dict[str, str]]] = None
                ) -> Response:
        """Send API request.
        """
