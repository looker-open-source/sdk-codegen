/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import com.looker.rtl.AuthToken
import com.looker.sdk.AccessToken
import org.junit.Test
import kotlin.test.assertEquals

class TestAuthToken {
    @Test
    fun defaultsWithEmptyToken() {
        val testToken = AuthToken()
        assertEquals(testToken.accessToken, "")
        assertEquals(testToken.tokenType, "")
        assertEquals(testToken.expiresIn, 0)
        assertEquals(testToken.refreshToken, null)
        assertEquals(testToken.isActive(), false)
    }

    @Test
    fun isActiveWithFullToken() {
        val testToken = AuthToken(
            accessToken = "all-access",
            tokenType = "backstage",
            expiresIn = 3600,
            refreshToken = "refresh"
        )

        assertEquals(testToken.accessToken, "all-access")
        assertEquals(testToken.tokenType, "backstage")
        assertEquals(testToken.expiresIn, 3600)
        assertEquals(testToken.refreshToken, "refresh")
        assertEquals(testToken.isActive(), true)
    }

    @Test
    fun has10SecondLag() {
        var actual = AuthToken(
            accessToken = "all-access",
            tokenType = "backstage",
            expiresIn = 9
        )

        assertEquals(actual.accessToken, "all-access")
        assertEquals(actual.tokenType, "backstage")
        assertEquals(actual.expiresIn, 9)
        assertEquals(actual.isActive(), false)
        actual = AuthToken(
            accessToken = "all-access",
            tokenType = "backstage",
            expiresIn = 11
        )

        assertEquals(actual.expiresIn, 11)
        assertEquals(actual.isActive(), true)
    }

    @Test
    fun setTokenWithFullAccessToken() {
        val testToken = AuthToken("accessToken", "type", 3600, "refreshToken")
        val updatedAccessToken = AccessToken("newAccess", "newType", 7200, "newRefresh")
        testToken.setToken(updatedAccessToken)

        assertEquals("newAccess", testToken.accessToken, "Access token should update")
        assertEquals("newType", testToken.tokenType, "Token type should update")
        assertEquals(7200, testToken.expiresIn, "Expires in should update")
        assertEquals("newRefresh", testToken.refreshToken, "Refresh token should update")
    }

    @Test
    fun setTokenWithNoRefreshToken() {
        val testToken = AuthToken("oldAccessToken", "oldType", 3600, "oldRefreshToken")
        val updatedAccessToken = AccessToken("newAccessToken", "newType", 7200)
        testToken.setToken(updatedAccessToken)

        assertEquals("newAccessToken", testToken.accessToken, "Access token should update")
        assertEquals("newType", testToken.tokenType, "Token type should update")
        assertEquals(7200, testToken.expiresIn, "Expires in should update")
        assertEquals("oldRefreshToken", testToken.refreshToken, "Refresh token should remain the same")
    }
}
