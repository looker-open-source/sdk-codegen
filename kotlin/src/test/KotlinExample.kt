
import com.looker.rtl.ApiSettingsIniFile
import com.looker.rtl.Transport
import com.looker.rtl.UserSession
import com.looker.sdk.*
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache.Apache
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import org.apache.http.conn.ssl.NoopHostnameVerifier
import org.apache.http.conn.ssl.TrustSelfSignedStrategy
import org.apache.http.ssl.SSLContextBuilder
import java.io.File
import java.lang.Thread.sleep

class KotlinExample {
    val config = TestConfig()
    val settings = ApiSettingsIniFile(config.localIni, "Looker")

    /**
     * Note: `TrustSelfSignedStrategy` should never be used in production. It is only for testing with self-signed certs
     * on local instances.
     */
    val client: HttpClient = HttpClient(Apache) {
        install(JsonFeature) {
            serializer = JacksonSerializer()
        }
        engine {
            customizeClient {
                setSSLContext(
                        SSLContextBuilder
                                .create()
                                .loadTrustMaterial(TrustSelfSignedStrategy())
                                .build()
                )
                setSSLHostnameVerifier(NoopHostnameVerifier())
            }
        }
    }

    val session = UserSession(settings, Transport(settings, client))

    val sdk = LookerSDK(session)

    fun findDashboardsByTitle(title: String): Array<Dashboard> {
        val dashboards = sdk.ok<Array<Dashboard>>(sdk.search_dashboards(title = title))
        if (dashboards.isNullOrEmpty()) {
            throw Error("No Dashboard(s) found with the title $title")
        }
        return dashboards
    }

    fun getDashboardTile(dash: Dashboard, title: String): DashboardElement? {
        val lowerTitle = title.toLowerCase()
        if(dash.dashboard_elements.isNullOrEmpty()) {
            return null
        }
        val element = dash.dashboard_elements!!.filter { element -> (element.title?.toLowerCase() ?: "") == lowerTitle }
        if (element.isEmpty()) {
            throw Error("No tile with title $title found on ${dash.title}.")
        }
        return element[0]
    }

    fun downloadTile(tile: DashboardElement, format: String): String {
        val fileName = "$tile.${format}"
        if(tile.query_id == null) {
            throw Error("No query found on ${tile.title}.")
        }
        try {
            val queryId = tile.query_id!!.toLong()
            val task = sdk.ok<RenderTask>(sdk.create_query_render_task(queryId, format, 640, 480))

            if (task.id == null) {
                throw Error("Could not create render task for ${tile.title}.")
            }
            var elapsed = 0.0
            val delay = 500L
            while (true) {
                val poll = sdk.ok<RenderTask>(sdk.render_task(task.id!!))
                if (poll.status == "failure") {
                    throw Error("Render failed for ${tile.title}.")
                }
                if (poll.status == "success") {
                    break
                }
                sleep(delay)
                elapsed += (delay / 1000)
                println("$elapsed seconds elapsed...")
            }

            val result = sdk.ok<String>(sdk.render_task_results(task.id!!))
            val outFile = File("/Users/Looker/Downloads/$fileName")
            outFile.writeBytes(result.toByteArray())
        } catch(error: Throwable) {
            println("FAIL! ${error.message}")
        }

        return fileName
    }
}

// TODO convert this to a functional test
//fun main(args: List<String>) {
//    val x = KotlinExample()
//    val dash = x.findDashboardsByTitle("Test")
//    val tile = x.getDashboardTile(dash[0], "Test")
//    if (tile != null) {
//        val down = x.downloadTile(tile, "txt")
//    }
//}
