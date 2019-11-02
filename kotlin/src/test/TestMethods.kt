import com.looker.rtl.ApiSettingsIniFile
import com.looker.rtl.SDKResponse
import com.looker.rtl.Transport
import com.looker.rtl.UserSession
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache.Apache
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import org.apache.http.conn.ssl.NoopHostnameVerifier
import org.apache.http.conn.ssl.TrustSelfSignedStrategy
import org.apache.http.ssl.SSLContextBuilder
import kotlin.test.assertEquals
import org.junit.Test as test
import com.looker.sdk.LookerSDK
import com.looker.sdk.WriteQuery
import junit.framework.Assert.assertTrue
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TestMethods {
    val localIni = "/Users/Looker/Documents/sdk_codegen/looker.ini"
    val settings = ApiSettingsIniFile(localIni, "Looker")

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

    @test fun testCreateQuery() {
        val response = sdk.create_query(WriteQuery("thelook", "users", arrayOf("users.count")))
        assertTrue(response is SDKResponse.SDKSuccessResponse<*>)
        assertTrue((response as SDKResponse.SDKSuccessResponse<*>).ok)
    }
}
