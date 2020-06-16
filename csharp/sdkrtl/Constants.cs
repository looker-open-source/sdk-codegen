using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;

namespace Looker.RTL
{
    public enum ResponseMode
    {
        Binary,
        String,
        Unknown
    }

    public struct Constants
    {
        /**
         * Default HTTP request timeout in seconds
         */
        public const int Timeout = 120;

        /**
         * Default SSL verification
         */
        public const bool VerifySsl = true;

        /**
     * Does this content type say it's utf-8?
     * @type {string} Regular expression for matching charset=utf-8 in Content-Type
     */
        const string MatchCharsetUtf8 = ";.*charset=.*\\butf-8\\b`";

        public static Regex IsCharsetUtf8 = new Regex(MatchCharsetUtf8,
            RegexOptions.CultureInvariant | RegexOptions.IgnoreCase | RegexOptions.Compiled);

        /**
     * Matching rules for string/text types. String matches must be checked *before* binary matches
     * @type {string} Regular expression for matching Content-Type headers
     */
        const string MatchModeString =
            "(^application\\/.*(\\bjson\\b|\\bxml\\b|\\bsql\\b|\\bgraphql\\b|\\bjavascript\\b|\\bx-www-form-urlencoded\\b)|^text\\/|.*\\+xml\\b|;.*charset=)";

        static readonly Regex ContentPatternString = new Regex(MatchModeString,
            RegexOptions.CultureInvariant | RegexOptions.IgnoreCase | RegexOptions.Compiled);

        /**
     * Matching rules for all binary or unknown types. Binary matches must be checked *after* string matches
     * @type {string} Regular expression for matching Content-Type headers
     */
        const string MatchModeBinary =
            "^image\\/|^audio\\/|^video\\/|^font\\/|^application\\/|^multipart\\/";

        static readonly Regex ContentPatternBinary = new Regex(MatchModeBinary,
            RegexOptions.CultureInvariant | RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public static ResponseMode ResponseMode(string contentType)
        {
            if (ContentPatternString.IsMatch(contentType))
            {
                return RTL.ResponseMode.String;
            }

            if (ContentPatternBinary.IsMatch(contentType))
            {
                return RTL.ResponseMode.Binary;
            }

            return RTL.ResponseMode.Unknown;
        }
        
        public static byte[] ReadAll(Stream inStream)
        {
            using var outStream = new MemoryStream();
            inStream.CopyTo(outStream);
            return outStream.ToArray();
        }
        
        public static byte[] StreamToByteArray(Stream stream)
        {
            if (stream is MemoryStream)
            {
                return ((MemoryStream)stream).ToArray();                
            }
            else
            {
                return ReadAll(stream);
            }
        }        
    }

    /**
     * Interface describing standard name/value pairs for the SDK
     */
    public interface IValues : IDictionary<string, object>
    {
    }

    /**
     * Concrete implementation of IValues for easy population of values
     */
    public class Values : Dictionary<string, object>, IValues
    {
    }
}