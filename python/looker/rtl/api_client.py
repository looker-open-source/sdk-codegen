# import datetime
# import json
# import mimetypes
# from multiprocessing.pool import ThreadPool
from typing import Dict, Tuple, Sequence
# import os
# import re
# import tempfile

from looker.configuration import Configuration
from sdk_error import SDKError
from sdk_utils import *

# https://mypy.readthedocs.io/en/latest/literal_types.html
from typing import Union, Tuple, Optional
from typing_extensions import Literal


class ApiClient(SDKBase): # might need to inherit from SDKBase
    def __init__(
        self,
        configuration: Configuration,
        header_name: str = None,
        header_value: str = None,
        cookie: str = None)

        self.configuration = configuration

        self.default_headers = {}
        if header_name is not None and header_value is not None:
            self.default_headers[header_name] = header_value
        
        self.cookie = cookie
        
        # TODO:this is if it is decided to store the version in a separate file to setup.py. setup.py would need to be modified too
        self.user_agent = f'LookerSDK {pkg.__version__}'  
        
        # TODO: thread pooling logic needs to happen here

    @property
    def user_agent(self):
            """User agent for this API client"""
        return self.default_headers['User-Agent']

    @user_agent.setter
    def user_agent(self, value: str):
        self.default_headers['User-Agent'] = value

    def call_api(
            self,
            resource_path: str,
            method: Literal['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
            path_params=Optional[str, int],
            query_params=Optional[Dict],
            header_params=Optional[Dict[str, str]]: None,
            body=Optional[Dict],
            files=None,
            response_type: str,
            auth_settings=None,
            _return_http_data_only: bool = False,
            collection_formats=None,
            #_preload_content=True,
            _request_timeout=Optional[int, Tuple[int, int]],
            _host: str = None):

        # header parameters
        header_params = header_params or {}
        header_params.update(self.default_headers)
        if self.cookie:
            header_params.update(Cookie=self.cookie)
        
        # TODO: Determine if sanitization is require at all
        if header_params:
            header_params = self.sanitize_for_serialization(header_params)
            header_params = dict(self.parameters_to_tuples(header_params,
                                                           collection_formats))

        # path parameters
        if path_params:
            path_params = self.sanitize_for_serialization(path_params)
            path_params = self.parameters_to_tuples(path_params,
                                                    collection_formats)
            for k, v in path_params:
                # specified safe chars, encode everything
                resource_path = resource_path.replace(
                    '{%s}' % k,
                    quote(str(v), safe=config.safe_chars_for_path_param)
                )

        # query parameters
        if query_params:
            query_params = self.sanitize_for_serialization(query_params)
            query_params = self.parameters_to_tuples(query_params,
                                                     collection_formats)

        # post parameters
        if post_params or files:
            post_params = post_params if post_params else []
            post_params = self.sanitize_for_serialization(post_params)
            post_params = self.parameters_to_tuples(post_params,
                                                    collection_formats)
            post_params.extend(self.files_parameters(files))

        # auth setting
        self.update_params_for_auth(header_params, query_params, auth_settings)

        # body
        if body:
            body = self.sanitize_for_serialization(body)

        # request url
        if _host is None:
            url = self.configuration.host + resource_path
        else:
            # use server/host defined in path or operation instead
            url = _host + resource_path

        # perform request and return response
        # TODO: determine if _preload_content is required for certain calls
        response_data = self.request(
            method, url, query_params=query_params, headers=header_params,
            post_params=post_params, body=body,
            #_preload_content=_preload_content,
            _request_timeout=_request_timeout)

        self.last_response = response_data

        return_data = response_data
        # TODO: Same as above. Commenting out for now.
        # if _preload_content:
        #     # deserialize response data
        #     if response_type:
        #         return_data = self.deserialize(response_data, response_type)
        #     else:
        #         return_data = None

        if _return_http_data_only:
            return (return_data)
        else:
            return (return_data, response_data.status_code,
                    response_data.headers)

# Other possible arguments here could be:
#   files, auth, allow_redirects, stream, verify, cert, json.
#   from https://github.com/kennethreitz/requests/blob/4983a9bde39c6320aa4f3e34e50dac6e263dab6f/requests/sessions.py#L466
def request(self,
            method: Literal['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
            url: str,
            params=Optional[Dict, List[Tuple], bytes] = None,
            data=Optional[Dict, List[Tuple], bytes] = None,
            headers: Dict[str, str],
            cookies = Optional[str] = None,
            timeout: Optional[int, Tuple[int, int]] = None):

        kwargs = selfLess(locals(), exclude=['method', 'url'])
        if method == "GET":
            return self.api_request.get(url, **kwargs)
        elif method == "HEAD":
            return self.api_request.HEAD(url, **kwargs)
        elif method == "OPTIONS":
            return self.api_request.OPTIONS(url, **kwargs)
        elif method == "POST":
            return self.api_request.POST(url, **kwargs)
        elif method == "PUT":
            return self.api_request.PUT(url, **kwargs)
        elif method == "PATCH":
            return self.api_request.PATCH(url, **kwargs)
        elif method == "DELETE":
            return self.api_request.DELETE(url, **kwargs)
        else:
            raise SDKError(f"{method} request failed."
                " HTTP method must be `GET`, `HEAD`, `OPTIONS`,"
                " `POST`, `PATCH`, `PUT` or `DELETE`."
            )
