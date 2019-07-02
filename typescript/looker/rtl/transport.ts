/** A transport is a generic way to make HTTP requests. */
export interface Transport {
  request<TSuccess, TError> (
    method: string,
    path: string,
    queryParams?: any,
    body?: any
  ): Promise<SDKResponse<TSuccess, TError>>
}

/** A successful SDK call. */
interface SDKSuccessResponse<T> {
  /** Whether the SDK call was successful. */
  ok: true
  /** The object returned by the SDK call. */
  value: T
}

/** An erroring SDK call. */
interface SDKErrorResponse<T> {
  /** Whether the SDK call was successful. */
  ok: false
  /** The error object returned by the SDK call. */
  error: T
}

/** An error representing an issue in the SDK, like a network or parsing error. */
export interface SDKError {
  type: 'sdk_error'
  message: string
}

export type SDKResponse<TSuccess, TError> = SDKSuccessResponse<TSuccess> | SDKErrorResponse<TError | SDKError>
