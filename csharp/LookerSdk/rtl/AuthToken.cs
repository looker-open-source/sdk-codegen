using System;
using System.Collections;
using System.Globalization;
using System.Security.Permissions;

#nullable enable

namespace Looker.RTL
{
    // TODO: replace IAccessToken with generated AccessToken interface
    // TODO: figure out nullable ints
    public interface IAccessToken
    {
        string? access_token { get; set; }
        string? token_type { get; set; }
        int expires_in { get; set; }
        string? refresh_token { get; set; }
    }

    /// <summary>
    /// Concrete implementation of IAccessToken
    /// </summary>
    public class AccessToken : IAccessToken
    {
        public string? access_token { get; set; }
        public string? token_type { get; set; }
        public int expires_in { get; set; }
        public string? refresh_token { get; set; }
    }

    /// <summary>
    /// Used to instantiate or check expiry of an AccessToken struct
    /// </summary>
    public class AuthToken: IAccessToken
    {
        private static long lagTime = 10;
        public string? access_token { get; set; }
        public string? token_type { get; set; }

        public int expires_in { get; set; }

        public string? refresh_token { get; set; }
        // Give a 10 second expiration window to account for latency
        public DateTime ExpiresAt { get; set; } = DateTime.Now.AddSeconds(-lagTime);

        public AuthToken() { }

        public AuthToken(IAccessToken token)
        {
            SetToken(token);
        }

        /// <summary>
        /// Assign token and set its expiration
        /// </summary>
        /// <param name="token"></param>
        public void SetToken(IAccessToken token)
        {
            if (token.token_type.IsFull())
            {
                token_type = token.token_type;
            }

            if (token.refresh_token.IsFull())
            {
                refresh_token = token.refresh_token;
            }

            expires_in = token.expires_in;
            access_token = token.access_token;
            ExpiresAt = DateTime.Now.AddSeconds(expires_in > 0 ? expires_in - lagTime : -lagTime);
        }

        /// <summary>
        /// True if authentication token has not timed out
        /// </summary>
        /// <returns></returns>
        public bool IsActive()
        {
            if (access_token.IsNullOrEmpty())
            {
                return false;
            }
            return ExpiresAt > DateTime.Now;
        }

        public AuthToken Reset()
        {
            access_token = null;
            expires_in = 0;
            ExpiresAt = DateTime.Now.AddSeconds(-lagTime);
            return this;
        }
    }
}
