import com.looker.rtl.*
import com.looker.sdk.*
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache.Apache
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import org.apache.http.conn.ssl.NoopHostnameVerifier
import org.apache.http.conn.ssl.TrustSelfSignedStrategy
import org.apache.http.ssl.SSLContextBuilder
import kotlin.test.assertEquals
import org.junit.Test as test
import junit.framework.Assert.assertTrue
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TestMethods {
    // TODO dynamically local ini file in tests. Possibly make into test initializer utils
//    val localIni = "/Users/Looker/Documents/sdk_codegen/looker.ini"
    val localIni = "/Users/Looker/sdk-codegen/looker.ini"
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

    @test fun testMe() {
        val me = sdk.ok<User>(sdk.me())
        val creds = me.credentials_api3
        assertNotNull(me)
        assertNotNull(me.id)
        assertNotNull(creds)
        assertTrue(creds.count() > 0)
        assertNotNull(creds[0].client_id)
    }

    @test fun testCreateQuery() {
        val response = sdk.create_query(WriteQuery("thelook", "users", arrayOf("users.count")))
        assertTrue(response is SDKResponse.SDKSuccessResponse<*>)
        assertTrue((response as SDKResponse.SDKSuccessResponse<*>).ok)
    }

    @test fun testAllUsers() {
        // TODO Is there any way we can avoid having to typecast sdk.ok()?
        // Problem here is there's no type verification between sdk.all_users() result and sdk.ok<foo>()
        val list = sdk.ok<Array<User>>(sdk.all_users())
        assertTrue(list.count() > 0, "Got users?")
        for (item in list) {
            // I see what you mean by the null check issue, Brian. We definitely want to solve this problem.
            item.id?.let {id ->
                val actual = sdk.ok<User>(sdk.user(id))
                val gotId = actual.id
                assertEquals(gotId, id)
            }
        }
    }

    @test fun testAllLooks() {
        val list = sdk.ok<Array<Look>>(sdk.all_looks())
        assertTrue(list.count() > 0, "Got looks?")
        for (item in list) {
            item.id?.let {id ->
                // Workaround for JSON parsing failure
                val actual = sdk.ok<LookWithQuery>(sdk.look(id, fields = Safe.Look))
//                val actual = sdk.ok<LookWithQuery>(sdk.look(id))
                val gotId = actual.id
                assertEquals(gotId, id)
            }
        }
    }

    @test fun testAllDashboards() {
        val list = sdk.ok<Array<DashboardBase>>(sdk.all_dashboards())
        assertTrue(list.count() > 0, "Got dashboards?")
        for (item in list) {
            item.id?.let {id ->
                // Workaround for JSON parsing failure
                // edit_uri sometimes can't be parsed to URL either .. need wrapper type like SdkUrl for safe parsing?
                val actual = sdk.ok<Dashboard>(sdk.dashboard(id, fields = Safe.Dashboard))
                val gotId = actual.id
                assertEquals(gotId, id)
            }
        }
    }

    @test fun testAllFolders() {
        val list = sdk.ok<Array<Folder>>(sdk.all_folders())
        assertTrue(list.count() > 0, "Got folders?")
        for (item in list) {
            item.id?.let {id ->
                val actual = sdk.ok<Folder>(sdk.folder(id))
                val gotId = actual.id
                assertEquals(gotId, id)
            }
        }
    }

    @test fun testAllSpaces() {
        val list = sdk.ok<Array<SpaceBase>>(sdk.all_spaces())
        assertTrue(list.count() > 0, "Got folders?")
        for (item in list) {
            item.id?.let {id ->
                val actual = sdk.ok<Space>(sdk.space(id))
                val gotId = actual.id
                assertEquals(gotId, id)
            }
        }
    }
}
