import requests
from typing import TypeVar

from looker.rtl.user_session import UserSession
from looker.rtl.transport import Transport
import 

T = TypeVar('T')

class APIMethods(object):
  def __init__(self, *args, **kwargs):
    # TODO figure out how this stuff composes
    # self._session = UserSession()
    # return super().__init__(*args, **kwargs)
    self.transport = Transport()

  def authHeader(self):
    return self.session.authHeader

  # get auth header and make sure it's valid
  # pass down to the transport layer

  # async get<TSuccess, TError>()
  # SDKResponse(TSuccess) -> TSuccess | TError
  # request wrapper
  # get(T,...) -> request('get',...)
  # request(T, httpmethod, path, query, body, headers, cookie)
  # - retain config settings
  #   - base URL to append endpoint path to
  #   - auth token handling
  #   - submit request
  #   - retrieve response
  #   - deserialize to requested type
  def get(self, 
          url: str,
          params=Optional[Dict, List[Tuple], bytes] = None,
          data=Optional[Dict, List[Tuple], bytes] = None,
          headers: Dict[str, str],
          cookies = Optional[str] = None,
          timeout: Optional[int, Tuple[int, int]] = None) -> T:
    return self.transport('GET', url, params, data, headers, cookies, timeout)

  def head(self,
          url: str,
          params=Optional[Dict, List[Tuple], bytes] = None,
          data=Optional[Dict, List[Tuple], bytes] = None,
          headers: Dict[str, str],
          cookies = Optional[str] = None,
          timeout: Optional[int, Tuple[int, int]] = None) -> T:
    return self.transport('HEAD', url, params, data, headers, cookies, timeout)

  def options(self,
          url: str,
          params=Optional[Dict, List[Tuple], bytes] = None,
          data=Optional[Dict, List[Tuple], bytes] = None,
          headers: Dict[str, str],
          cookies = Optional[str] = None,
          timeout: Optional[int, Tuple[int, int]] = None) -> T:
    return self.transport('OPTIONS', url, params, data, headers, cookies, timeout)

  def post(self,
          url: str,
          params=Optional[Dict, List[Tuple], bytes] = None,
          data=Optional[Dict, List[Tuple], bytes] = None,
          headers: Dict[str, str],
          cookies = Optional[str] = None,
          timeout: Optional[int, Tuple[int, int]] = None) -> T:
    return self.transport('POST', url, params, data, headers, cookies, timeout)

  def put(self,
          url: str,
          params=Optional[Dict, List[Tuple], bytes] = None,
          data=Optional[Dict, List[Tuple], bytes] = None,
          headers: Dict[str, str],
          cookies = Optional[str] = None,
          timeout: Optional[int, Tuple[int, int]] = None) -> T:
    return self.transport('PUT', url, params, data, headers, cookies, timeout)

  def patch(self,
          url: str,
          params=Optional[Dict, List[Tuple], bytes] = None,
          data=Optional[Dict, List[Tuple], bytes] = None,
          headers: Dict[str, str],
          cookies = Optional[str] = None,
          timeout: Optional[int, Tuple[int, int]] = None) -> T:
    return self.transport('PATCH', url, params, data, headers, cookies, timeout)

  def delete((self,
          url: str,
          params=Optional[Dict, List[Tuple], bytes] = None,
          data=Optional[Dict, List[Tuple], bytes] = None,
          headers: Dict[str, str],
          cookies = Optional[str] = None,
          timeout: Optional[int, Tuple[int, int]] = None) -> T:
    return self.transport('DELETE', url, params, data, headers, cookies, timeout)
