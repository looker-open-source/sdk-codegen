import { SDKError, SDKResponse, Transport } from './transport'

export interface BrowserTransportOptions {
  baseUrl: string
  headers?: Headers
}

function addQueryParams (path: string, obj?: { [key: string]: string }) {
  if (!obj) {
    return path
  }
  const keys = Object.keys(obj)
  if (keys.length === 0) {
    return path
  } else {
    const qp = keys.map((k) => k + '=' + encodeURIComponent(obj[k])).join('&')
    return `${path}?${qp}`
  }
}

async function parseResponse (contentType: string, res: Response) {
  if (contentType.match(/application\/json/g)) {
    try {
      return await res.json()
    } catch (error) {
      return Promise.reject(error)
    }
  } else if (contentType === 'text' || contentType.startsWith('text/')) {
    return res.text()
  } else {
    try {
      return await res.blob()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export class BrowserTransport implements Transport {

  constructor (private options: BrowserTransportOptions) {
    this.options = options
  }

  async request<TSuccess, TError> (
    method: string,
    path: string,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>> {
    const req = fetch(
      this.options.baseUrl + addQueryParams(path, queryParams),
      {
        body: body ? JSON.stringify(body) : undefined,
        headers: this.options.headers || new Headers(),
        credentials: 'same-origin',
        method
      }
    )

    try {
      const res = await req
      const contentType = String(res.headers.get('content-type'))
      const parsed = await parseResponse(contentType, res)
      if (res.ok) {
        return { ok: true, value: parsed }
      } else {
        return { ok: false, error: parsed }
      }
    } catch (e) {
      const error: SDKError = {
        type: 'sdk_error',
        message: typeof e.message === 'string' ? e.message : `The SDK call was not successful. The error was '${e}'.`
      }
      return { ok: false, error }
    }
  }
}
