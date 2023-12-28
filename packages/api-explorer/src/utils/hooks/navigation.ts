/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import { useHistory } from 'react-router-dom';

const GLOBAL_PARAMS = ['s', 'sdk'];

interface QueryParamProps {
  /** Search Query **/
  s?: string | null;
  /** Chosen SDK Language **/
  sdk?: string | null;
  /** Tag Scene Filter **/
  t?: string | null;
}

/**
 * Hook for navigating to given route with query params
 */
export const useNavigation = () => {
  const history = useHistory();

  /**
   * Navigates to path including provided search parameters
   *
   * @param path Pathname to navigate to
   * @param queryParams Hash of query param name/value pairs to include in the destination url
   */
  const navigate = (path: string, queryParams?: QueryParamProps | null) => {
    const urlParams = new URLSearchParams(history.location.search);

    if (queryParams === undefined) {
      // if params passed in is undefined, maintain existing parameters in the URL
      history.push({ pathname: path, search: urlParams.toString() });
    } else if (queryParams === null) {
      // if params passed in is null, remove all parameters from the URL
      history.push({ pathname: path });
    } else {
      // push each key as new param to URL, excluding entries with value null
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === null || queryParams[key] === '') {
          urlParams.delete(key);
        } else {
          urlParams.set(key, queryParams[key]);
        }
      });
      history.push({ pathname: path, search: urlParams.toString() });
    }
  };

  /**
   * Builds path to a scene and removes any scene-specific URL parameters
   *
   * @param path        the destination path
   * @param otherParams other query parameters to append to url
   * @returns a path excluding scene-specific search parameters
   */
  const buildPathWithGlobalParams = (path: string, otherParams = {}) => {
    const params = new URLSearchParams(history.location.search);

    for (const key of params.keys()) {
      if (!GLOBAL_PARAMS.includes(key)) {
        params.delete(key);
      }
    }
    const globalParams = params.toString();

    let additionalParams = '';
    Object.entries(otherParams).forEach(([key, value]) => {
      additionalParams += `${key}=${value}`;
    });

    let queryString = '';
    if (globalParams) {
      queryString = globalParams;
    }

    if (additionalParams) {
      queryString += globalParams ? `&${additionalParams}` : additionalParams;
    }

    return `${path}${queryString ? `?${queryString}` : ''}`;
  };

  /**
   * Navigates to a scene removing any scene-specific URL parameters
   *
   * @param path Pathname to navigate to
   */
  const navigateWithGlobalParams = (path: string) => {
    history.push(buildPathWithGlobalParams(path));
  };

  return {
    navigate,
    navigateWithGlobalParams,
    buildPathWithGlobalParams,
  };
};
