"""Types and abstract base class for transport implementations.
"""

import abc
import dataclasses
import enum
from typing import Any, Callable, Generic, MutableMapping, Optional, TypeVar, Union

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


T = TypeVar('T')  # pylint: disable=invalid-name


@dataclasses.dataclass(frozen=True)
class SDKSuccessResponse(Generic[T]):
    """Success Response object.
    """
    value: T
    ok: bool = True


@dataclasses.dataclass(frozen=True)
class SDKErrorResponse(Generic[T]):
    """Error Response object.
    """
    error: T
    ok: bool = False


@dataclasses.dataclass(frozen=True)
class SDKError(Generic[T]):
    """Network/Infrastructure Error object.
    """
    message: str
    type: str = 'sdk_error'


class Transport(abc.ABC):
    """Transport base class.
    """
    @classmethod
    @abc.abstractmethod
    def configure(cls, settings: TransportSettings):
        """Configure and return an instance of Transport
        """

    # pylint: disable=too-many-arguments
    @abc.abstractmethod
    def request(
            self,
            method: HttpMethod,
            path: str,
            query_params: Any = None,
            body: Any = None,
            authenticator: Callable[[Any], Any] = None
    ) -> Union[SDKSuccessResponse, Union[SDKErrorResponse, SDKError]]:
        """Send API request.
        """
