import com.looker.rtl.ApiSettingsIniFile
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
import kotlin.test.assertNotNull

class TestMethods {
    val localIni = "/Users/looker/sdk-codegen/looker.ini"
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

    @test fun defaultsWithEmptyToken() {
        val hub = sdk.accept_integration_hub_legal_agreement(1)
        assertNotNull(hub)
//        val testToken = AuthToken()
//        assertEquals(testToken.accessToken, "")
//        assertEquals(testToken.tokenType, "")
//        assertEquals(testToken.expiresIn, 0)
//        assertEquals(testToken.isActive(), false)
    }
}
