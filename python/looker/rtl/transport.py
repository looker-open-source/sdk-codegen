import requests
from api_settings import ApiSettings

class Transport(requests.Session):
    def __init__(self):
        # figure out how this plugs into requests.Session
        
    def http_method(self,
                method: Literal['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
                url: str,
                params=Optional[Dict, List[Tuple], bytes] = None,
                data=Optional[Dict, List[Tuple], bytes] = None,
                headers: Dict[str, str],
                cookies = Optional[str] = None,
                timeout: Optional[int, Tuple[int, int]] = None):

            kwargs = selfLess(locals(), exclude=['method'])
            if method == "GET":
                return self.session.get(**kwargs)
            elif method == "HEAD":
                return self.session.head(**kwargs)
            elif method == "OPTIONS":
                return self.session..OPTIONS(**kwargs)
            elif method == "POST":
                return self.session.POST(**kwargs)
            elif method == "PUT":
                return self.session.PUT(**kwargs)
            elif method == "PATCH":
                return self.session.PATCH(**kwargs)
            elif method == "DELETE":
                return self.session.DELETE(**kwargs)
            else:
                raise SDKError(f"{method} request failed."
                    " HTTP method must be `GET`, `HEAD`, `OPTIONS`,"
                    " `POST`, `PATCH`, `PUT` or `DELETE`."
                )

