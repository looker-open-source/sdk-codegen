import com.looker.rtl.ApiSettings
import com.looker.rtl.AuthSession
import com.looker.rtl.ConfigurationProvider
import com.looker.rtl.DEFAULT_TIMEOUT
import org.junit.Test
import kotlin.test.assertEquals

val bareMinimum = """
[Looker]
base_url=https://my.looker.com:19999
""".trimIndent()

val quotedMinimum = """
[Looker]
base_url='https://my.looker.com:19999'
""".trimIndent()

val mockId = "IdOverride"
val mockSecret = "SecretOverride"

class MockSettings(contents: String) : ConfigurationProvider by ApiSettings.fromIniText(contents) {
    override fun readConfig(): Map<String, String> {
        return mapOf(
            "base_url" to baseUrl,
            "verify_ssl" to verifySSL.toString(),
            "timeout" to timeout.toString(),
            "headers" to headers.toString(),
            "client_id" to mockId,
            "client_secret" to mockSecret
        )
    }
}

class TestApiSettings {
    @Test
    fun testApiSettingsDefaults() {
        val settings = ApiSettings.fromIniText(bareMinimum)
        val config = settings.readConfig()
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL is read")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
        assertEquals(config["client_id"], null)
        assertEquals(config["client_secret"], null)
    }

    @Test
    fun testApiSettingsQuotes() {
        val settings = ApiSettings.fromIniText(quotedMinimum)
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL has no quotes")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
    }

    @Test
    fun testApiSettingsOverrides() {
        val settings = MockSettings(bareMinimum)
        val config = settings.readConfig()
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL is read")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
        assertEquals(config["client_id"], mockId)
        assertEquals(config["client_secret"], mockSecret)
    }

    @Test
    fun testSessionOverride() {
        val settings = MockSettings(bareMinimum)
        val session = AuthSession(settings)
        val config = session.apiSettings.readConfig()
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL is read")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
        assertEquals(config["client_id"], mockId)
        assertEquals(config["client_secret"], mockSecret)
    }
}
