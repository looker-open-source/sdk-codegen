package com.looker.rtl

import io.ktor.client.call.receive
import io.ktor.client.response.HttpResponse
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking

class FailureResponseError(val result: SdkResult<*, *>) : Exception()

interface SdkResponse<T> {
    val success: Boolean
    val statusCode: Int
    val method: HttpMethod
    val path: String
    fun body(): T
}

sealed class SdkResult<out TSuccess, out TFailure> {
    abstract val success: Boolean
    abstract val method: HttpMethod
    abstract val path: String

    data class SuccessResponse<TSuccess>(
        val response: HttpResponse,
        override val method: HttpMethod,
        override val path: String,
        private val body: TSuccess
    ) : SdkResponse<TSuccess>, SdkResult<TSuccess, Nothing>() {
        override val success: Boolean = true
        override val statusCode: Int = response.status.value

        override fun body(): TSuccess = body

        inline fun <reified T> bodyAs(): T {
            return runBlocking { response.receive<T>() }
        }
    }

    data class FailureResponse<TFailure>(
        val response: HttpResponse,
        override val method: HttpMethod,
        override val path: String,
        private val body: TFailure
    ) : SdkResponse<TFailure>, SdkResult<Nothing, TFailure>() {
        override val success: Boolean = false
        override val statusCode: Int = response.status.value

        override fun body(): TFailure = body

        inline fun <reified T> bodyAs(): T {
            return runBlocking { response.receive<T>() }
        }
    }

    data class Error(
        val error: Throwable,
        override val method: HttpMethod,
        override val path: String
    ) : SdkResult<Nothing, Nothing>() {
        override val success: Boolean = false
    }

    companion object {
        inline fun <reified TSuccess, reified TFailure> response(
            response: HttpResponse,
            method: HttpMethod,
            path: String
        ): SdkResult<TSuccess, TFailure> {
            try {
                if (response.status.isSuccess()) {
                    val body = runBlocking { response.receive<TSuccess>() }
                    return SuccessResponse<TSuccess>(response, method, path, body)
                } else {
                    val body = runBlocking { response.receive<TFailure>() }
                    return FailureResponse<TFailure>(response, method, path, body)
                }
            } catch (ex: Exception) {
                return error(ex, method, path)
            }
        }

        fun <TSuccess, TFailure> error(
            error: Throwable,
            method: HttpMethod,
            path: String
        ): SdkResult<TSuccess, TFailure> {
            return SdkResult.Error(error, method, path)
        }
    }
}

fun <TSuccess> SdkResult<TSuccess, *>.ok(): TSuccess {
    return when (this) {
        is SdkResult.SuccessResponse<TSuccess> -> {
            this.body()
        }
        is SdkResult.FailureResponse<*> -> {
            throw FailureResponseError(this)
        }
        is SdkResult.Error -> {
            throw this.error
        }
    }
}
