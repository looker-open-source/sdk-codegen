import com.looker.rtl.*
import com.looker.sdk.Dashboard
import com.looker.sdk.Look
import com.looker.sdk.LookerSDK
import kotlinx.coroutines.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import org.junit.Test as test

class TestAsync {
    val config = TestConfig()
    var settings = ApiSettingsIniFile(config.localIni, "Looker")

    val client = customClient(testSettings(settings))
    val session = UserSession(settings, Transport(settings, client))

    val sdk = LookerSDK(session)

    private fun testSettings(options: TransportOptions) : TransportOptions {
        var result = options
        // Set timeout to 120 seconds
        result.timeout = 120
        result.verifySSL = false
        return result
    }

    // see https://kotlinlang.org/docs/reference/coroutines/composing-suspending-functions.html#structured-concurrency-with-async
    private suspend fun recentParallel(limit: Long? = 9) : Pair<Array<Dashboard>, Array<Look>> = coroutineScope {
        val recentDashboards = async { sdk.ok<Array<Dashboard>>(sdk.search_dashboards(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
        val recentLooks = async { sdk.ok<Array<Look>>(sdk.search_looks(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
        Pair(recentDashboards.await(), recentLooks.await())
    }

    @test
    fun testRecentParallel() {
        val limit: Long? = 9
        runBlocking {
            val pair = recentParallel(limit)
            val dashboards = pair.first
            val looks = pair.second
            assertNotNull(dashboards)
            assertNotNull(looks)
            val l = limit!!.toInt()
            assertEquals(l, dashboards.count(), "$l Dashboards")
            assertEquals(l, looks.count(), "$l Looks")
        }
    }

    private suspend fun recentSerial(limit: Long? = 9) : Pair<Array<Dashboard>, Array<Look>> = coroutineScope {
        val recentDashboards = withContext(Dispatchers.Default) { sdk.ok<Array<Dashboard>>(sdk.search_dashboards(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
        val recentLooks = withContext(Dispatchers.Default) { sdk.ok<Array<Look>>(sdk.search_looks(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
        Pair(recentDashboards, recentLooks)
    }

    @test
    fun testRecentSerial() {
        val limit: Long? = 9
        runBlocking {
            val pair = recentSerial(limit)
            val dashboards = pair.first
            val looks = pair.second
            assertNotNull(dashboards)
            assertNotNull(looks)
            val l = limit!!.toInt()
            assertEquals(l, dashboards.count(), "$l Dashboards")
            assertEquals(l, looks.count(), "$l Looks")
        }
    }

    @test fun testRecent() {
        val limit: Long? = 9
        val recentDashboards = sdk.ok<Array<Dashboard>>(sdk.search_dashboards(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc"))
        val dash2 = sdk.ok<Array<Dashboard>>(sdk.search_dashboards(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc"))
        val recentLooks = sdk.ok<Array<Look>>(sdk.search_looks(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc"))
        val look2 = sdk.ok<Array<Look>>(sdk.search_looks(limit = limit, last_viewed_at = "not null", sorts = "last_viewed_at desc"))
        assertNotNull(recentDashboards)
        assertNotNull(dash2)
        assertNotNull(recentLooks)
        assertNotNull(look2)
        val l = limit!!.toInt()
        assertEquals(l, recentDashboards.count(), "$l Dashboards")
        assertEquals(l, dash2.count(),"$l Dashboards")
        assertEquals(l, recentLooks.count(), "$l Looks")
        assertEquals(l, look2.count(), "$l Looks")
    }

}
