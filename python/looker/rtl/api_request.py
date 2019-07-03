import requests
from typing import TypeVar

from looker.rtl.user_session import UserSession

T = TypeVar('T')

class ApiRequest(Request):
  def __init__(self, *args, **kwargs):
    # TODO figure out how this stuff composes
    self._session = UserSession()
    return super().__init__(*args, **kwargs)

  def authHeader(self):
    return self.session.authHeader

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
    responseType: T,
    endpoint: str,
    path: Dict[any],
    query: Dict[any],
    body: any,
    headers: Dict[any],
    cookies: Dict[any]) -> T:
    return requests.get(T,path,query,body,headers,cookies)

