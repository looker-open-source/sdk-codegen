import org.junit.Test
import java.net.URI
import kotlin.test.assertEquals

class TestModels {
    @Test
    fun testParseUri() {
        val value = "/projects/cucu_thelook_1552930443_project/files/business_pulse.dashboard.lookml?line=1"
        val url = URI(value)
        assertEquals(url.toString(), value)
    }
}
