using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;

namespace Looker.RTL
{
    /// <summary>
    /// Response mode enums
    ///
    /// TODO: add Json for application/json MIME types?
    /// </summary>
    public enum ResponseMode
    {
        Binary,
        String,
        Unknown
    }

    /// <summary>
    /// SDK Exception class for recognizing SDK-specific errors and eventual customization
    /// </summary>
    public class SdkError : Exception
    {
        public SdkError() : base() {}
        
        public SdkError(string message): base(message) {}
    }
    
    public struct Constants
    {
        /// <summary>
        /// Default HTTP request timeout in seconds
        /// </summary>
        public const int Timeout = 120;

        /// <summary>
        /// Default SSL verification
        /// </summary>
        public const bool VerifySsl = true;

        private const string MatchCharsetUtf8 = ";.*charset=.*\\butf-8\\b`";

        /// <summary>
        /// Is this content type utf-8?
        /// </summary>
        public static Regex IsCharsetUtf8 = new Regex(MatchCharsetUtf8,
            RegexOptions.CultureInvariant | RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private const string MatchModeString =
            "(^application\\/.*(\\bjson\\b|\\bxml\\b|\\bsql\\b|\\bgraphql\\b|\\bjavascript\\b|\\bx-www-form-urlencoded\\b)|^text\\/|.*\\+xml\\b|;.*charset=)";

        internal static readonly Regex ContentPatternString = new Regex(MatchModeString,
            RegexOptions.CultureInvariant | RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private const string MatchModeBinary =
            "^image\\/|^audio\\/|^video\\/|^font\\/|^application\\/|^multipart\\/";

        internal static readonly Regex ContentPatternBinary = new Regex(MatchModeBinary,
            RegexOptions.CultureInvariant | RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public const string DefaultApiVersion = "4.0";
        public const string AgentPrefix = "CS-SDK";
        public const string LookerVersion = "25.8";

        public const string Bearer = "Bearer";
        public const string LookerAppiId = "x-looker-appid";
    }

    /// <summary>
    /// Interface describing standard name/value pairs for the SDK
    /// </summary>
    public interface IValues : IDictionary<string, object>
    {
    }

    /// <summary>
    /// Concrete implementation of IValues for easy population of values
    /// </summary>
    public class Values : Dictionary<string, object>, IValues
    {
    }
}