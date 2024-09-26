using System;
using Looker.RTL;
using Xunit;

namespace sdkrtl.Tests
{
    public class AuthTokenTests
    {
        /// <summary>
        /// Confirms the defaults when initializing AuthToken without arguments
        /// </summary>
        [Fact]
        public void DefaultsTest()
        {
            AuthToken actual = new AuthToken();
            Assert.Null(actual.access_token);
            // ReSharper disable once HeuristicUnreachableCode
            Assert.Null(actual.token_type);
            Assert.Equal(0, actual.expires_in);
            Assert.Null(actual.refresh_token);
            Assert.False(actual.IsActive());
        }

        /// <summary>
        /// Confirm active token when AuthToken is initialized with an AccessToken instance
        /// </summary>
        [Fact]
        public void FullTokenTest()
        {
            var token = new AccessToken
            {
                access_token = "all-access",
                expires_in = 3600,
                token_type = "backstage"
            };
            var actual = new AuthToken(token);
            Assert.Equal(token.access_token, actual.access_token);
            Assert.Equal(token.expires_in, actual.expires_in);
            Assert.Equal(token.token_type, actual.token_type);
            Assert.True(actual.IsActive());
        }
        
        /// <summary>
        /// Verify 10 second lag time is in effect
        /// </summary>
        [Fact]
        public void LagTimeTest()
        {
            var token = new AccessToken
            {
                access_token = "all-access",
                expires_in = 9,
                token_type = "backstage"
            };
            var actual = new AuthToken(token);
            Assert.Equal(token.access_token, actual.access_token);
            Assert.Equal(token.expires_in, actual.expires_in);
            Assert.Equal(token.token_type, actual.token_type);
            Assert.False(actual.IsActive());
            token = new AccessToken
            {
                access_token = "all-access",
                expires_in = 11,
                token_type = "backstage"
            };
            actual = new AuthToken(token);
            Assert.Equal(token.access_token, actual.access_token);
            Assert.Equal(token.expires_in, actual.expires_in);
            Assert.Equal(token.token_type, actual.token_type);
            Assert.True(actual.IsActive());
        }
    }
}
