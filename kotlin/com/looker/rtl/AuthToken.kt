package com.looker.rtl

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class AuthToken(
        @JsonProperty("access_token")
        var accessToken: String = "",  // TODO: Consider making this/these vals and using new objects instead of mutating
        @JsonProperty("token_type")
        val tokenType: String = "",
        @JsonProperty("expires_in")
        var expiresIn: Long = 0,
        @JsonProperty("expires_at")
        var expiresAt: LocalDateTime = LocalDateTime.now()) {

    constructor(token: AuthToken): this(token.accessToken, token.tokenType, token.expiresIn, token.expiresAt)

    init {
        if (expiresIn > 0) {
            expiresAt = LocalDateTime.now().plusSeconds(expiresIn)
        }
    }

    fun isActive(): Boolean {
        if (accessToken.isEmpty()) return false
        return expiresAt > LocalDateTime.now()
    }

    fun reset() {  // TODO: Should this just return a blank AuthToken object instead?
        accessToken = ""
        expiresIn = 0
    }
}