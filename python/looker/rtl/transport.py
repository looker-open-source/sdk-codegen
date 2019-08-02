"""Types and abstract base class for transport implementations.
"""
import abc
import enum
from typing import Callable, Dict, MutableMapping, Optional, Union

import attr

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


@attr.s(auto_attribs=True)
class TransportSettings:
    """Basic transport settings.
    """
    base_url: str
    api_version: str = '3.1'
    verify_ssl: bool = True
    headers: Optional[MutableMapping[str, str]] = None

    @property
    def url(self) -> str:
        """Create and return an API-versioned base endpoint.
        """
        return f'{self.base_url.rstrip("/")}/api/{self.api_version}'


TResponseValue = Union[str, bytes]


@attr.s(auto_attribs=True)
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
    def configure(cls, settings: TransportSettings) -> 'Transport':
        """Configure and return an instance of Transport
        """

    # pylint: disable=too-many-arguments
    @abc.abstractmethod
    def request(self,
                method: HttpMethod,
                path: str,
                query_params: Optional[MutableMapping[str, str]] = None,
                body: Optional[bytes] = None,
                authenticator: Optional[Callable[[], Dict[str, str]]] = None
               ) -> Response:
        """Send API request.
        """
