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

  def get(self,
    responseType: T,
    path: Dict[any],
    query: Dict[any],
    body: any,
    headers: Dict[any],
    cookies: Dict[any]) -> T:

