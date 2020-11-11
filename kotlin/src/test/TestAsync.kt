
import kotlinx.coroutines.*

class TestAsync {
    // for >7.2
//    private val sdk = TestConfig().sdk
//
//    // see https://kotlinlang.org/docs/reference/coroutines/composing-suspending-functions.html#structured-concurrency-with-async
//    private suspend fun recentParallel(dashLimit: Long?, lookLimit: Long?): Pair<Array<Dashboard>, Array<Look>> = coroutineScope {
//        val recentDashboards = async { sdk.ok<Array<Dashboard>>(sdk.search_dashboards(
//                limit = dashLimit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
//        val recentLooks = async { sdk.ok<Array<Look>>(sdk.search_looks(
//                limit = lookLimit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
//        Pair(recentDashboards.await(), recentLooks.await())
//    }
//
//    private fun listLimits() : Pair<Long?, Long?> {
//        // estimate what may be the correct count of viewed looked and dashboards
//        // since `last_viewed_at` is not in DashboardBase, it's going to be an approximation
//        val allDash = sdk.ok<Array<DashboardBase>>(sdk.all_dashboards("id"))
//        val allLooks = sdk.ok<Array<Look>>(sdk.all_looks("id, last_viewed_at"))
//        val viewedLooks = allLooks.filter { l -> l.last_viewed_at !== null }
//        val dashLimit = minOf(9, allDash.count())
//        val lookLimit = minOf( 9, viewedLooks.count())
//        assertNotEquals(0, dashLimit, "There are no viewed dashboards")
//        assertNotEquals(0, lookLimit, "There are no viewed looks")
//        return Pair(dashLimit.toLong(), lookLimit.toLong())
//    }
//
//    @test
//    fun testRecentParallel() {
//        val limits = listLimits()
//        runBlocking {
//            val pair = recentParallel(limits.first, limits.second)
//            val dashboards = pair.first
//            val looks = pair.second
//            assertNotNull(dashboards)
//            assertNotNull(looks)
//            assertEquals(limits.first!!.toInt(), dashboards.count(), "${limits.first} viewed Dashboards")
//            assertEquals(limits.second!!.toInt(), looks.count(), "${limits.second} viewed Looks")
//        }
//    }
//
//    private suspend fun recentSerial(dashLimit: Long?, lookLimit: Long?): Pair<Array<Dashboard>, Array<Look>> = coroutineScope {
//        val recentDashboards = withContext(Dispatchers.Default) { sdk.ok<Array<Dashboard>>(sdk.search_dashboards(
//                limit = dashLimit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
//        val recentLooks = withContext(Dispatchers.Default) { sdk.ok<Array<Look>>(sdk.search_looks(
//                limit = lookLimit, last_viewed_at = "not null", sorts = "last_viewed_at desc")) }
//        Pair(recentDashboards, recentLooks)
//    }
//
//    @test
//    fun testRecentSerial() {
//        val limits = listLimits()
//        runBlocking {
//            val pair = recentSerial(limits.first, limits.second)
//            val dashboards = pair.first
//            val looks = pair.second
//            assertNotNull(dashboards)
//            assertNotNull(looks)
//            assertEquals(limits.first!!.toInt(), dashboards.count(), "${limits.first} viewed Dashboards")
//            assertEquals(limits.second!!.toInt(), looks.count(), "${limits.second} viewed Looks")
//        }
//    }
}
