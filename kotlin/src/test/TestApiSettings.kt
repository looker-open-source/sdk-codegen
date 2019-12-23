import com.looker.rtl.ApiSettings
import com.looker.rtl.DEFAULT_API_VERSION
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

class TestApiSettings {
    @Test fun testApiSettingsDefaults() {
        val settings = ApiSettings(bareMinimum)
        assertEquals(settings.apiVersion, DEFAULT_API_VERSION, "API version defaults to 3.1")
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL is read")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
    }

    @Test fun testApiSettingsQuotes() {
        val settings = ApiSettings(quotedMinimum)
        assertEquals(settings.apiVersion, DEFAULT_API_VERSION, "API version defaults to 3.1")
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL has no quotes")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
    }
}
