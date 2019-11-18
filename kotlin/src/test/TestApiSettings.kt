import com.looker.rtl.ApiSettings
import com.looker.rtl.DEFAULT_API_VERSION
import com.looker.rtl.DEFAULT_TIMEOUT
import com.looker.rtl.asBoolean
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

val bareMinimum = """
[Looker]
base_url=https://my.looker.com:19999
""".trimIndent()

class TestApiSettings {
    @Test fun testApiSettingsDefaults() {
        val settings = ApiSettings(bareMinimum)
        assertEquals(settings.apiVersion, DEFAULT_API_VERSION, "API version defaults to 3.1")
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL is read")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
    }

    @Test fun testBoolStrings() {
        asBoolean("1")?.let { assertTrue(it) }
        asBoolean("y'")?.let { assertTrue(it) }
        asBoolean("YES'")?.let { assertTrue(it) }
        asBoolean("t'")?.let { assertTrue(it) }
        asBoolean("TRUE'")?.let { assertTrue(it) }
        asBoolean("true'")?.let { assertTrue(it) }
        asBoolean("0")?.let { assertFalse(it) }
        asBoolean("f'")?.let { assertFalse(it) }
        asBoolean("FALSE'")?.let { assertFalse(it) }
        asBoolean("n'")?.let { assertFalse(it) }
        asBoolean("N'")?.let { assertFalse(it) }
        asBoolean("NO'")?.let { assertFalse(it) }
        asBoolean("null")?.let { assertNull(it)}
        asBoolean("boo")?.let { assertNull(it)}
    }
}
