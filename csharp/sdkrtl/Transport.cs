namespace Looker.RTL
{

    /** Interface for API transport values */
    public interface ITransportSettings
    {
        /** base URL of API REST web service */
        string base_url { get; set; }
        /** whether to verify ssl certs or not. Defaults to true */
        bool verify_ssl { get; set; }
        /** request timeout in seconds. Default to 30 */
        int timeout { get; set; }
        /** agent tag to use for the SDK requests  */
        string agentTag { get; set; }
    }
}
