import com.looker.rtl.DelimArray
import com.looker.rtl.SDKResponse
import com.looker.sdk.*
import org.junit.Test
import java.io.Serializable
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TestSmoke {
    private val sdk by lazy { TestConfig().sdk }

    private fun prepUsers(): User {
        val first = "SDK"
        val last = "User"
        val users = sdk.ok<Array<User>>(sdk.search_users(first_name = first, last_name = last))
        assertNotNull(users)
        val user = if (users.isNotEmpty()) {
            users.first()
        } else {
            sdk.ok(sdk.create_user(WriteUser(first_name = first, last_name = last)))
        }
        assertNotNull(user)
        return user
    }

    private fun simpleQuery(): WriteQuery {
        return WriteQuery(
            "system__activity",
            "dashboard",
            arrayOf("dashboard.id", "dashboard.title", "dashboard.count"),
            limit = "100"
        )
    }

    @ExperimentalUnsignedTypes
    fun mimeType(data: UByteArray): String {

        val b = data[0]
        val n = b.toUInt().toInt()
        return when (n) {
            0xFF -> "image/jpeg"
            0x89 -> "image/png"
            0x47 -> "image/gif"
            0x4D, 0x49 -> "image/tiff"
            0x25 -> "application/pdf"
            0xD0 -> "application/vnd"
            0x46 -> "text/plain"
            else -> "application/octet-stream"
        }
    }

    /**
     * Smoke: GET, int param, binary download, and multiple content types
     */
    @ExperimentalUnsignedTypes
    @Test
    fun testContentThumbnail() {
        var type = ""
        var id = ""
        val looks = sdk.ok<Array<Look>>(sdk.search_looks(limit = 1))
        assertNotNull(looks)
        if (looks.isNotEmpty()) {
            type = "look"
            looks[0].id?.let { lookId ->
                id = lookId.toString()
            }
        }
        if (id === "") {
            val dashboards = sdk.ok<Array<Dashboard>>(sdk.search_dashboards(limit = 1))
            assertNotNull(dashboards)
            if (dashboards.isNotEmpty()) {
                type = "dashboard"
                dashboards[0].id?.let {
                    dashId ->
                    id = dashId
                }
            }
        }
        assertNotEquals("", type, "Type should be 'look' or 'dashboard'")
        assertNotEquals("", id, "Look or dashboard ID should be assigned")
        val svg = sdk.ok<String>(sdk.content_thumbnail(type, id))
        assertTrue(svg.contains("<?xml"), "$type $id SVG should have '<?xml'")
        val response = sdk.ok<ByteArray>(sdk.stream.content_thumbnail(type, id, format = "png"))
        val png = response.toUByteArray()
        val mime = mimeType(png)
        assertNotNull(png)
        assertEquals("image/png", mime, "png is png?")
    }

    /**
     * Smoke: PATCH, boolean property
     */
    @Test
    fun testUserDisabling() {
        val user = prepUsers()
        val id = user.id!!
        val toggle = user.is_disabled!!
        var body = WriteUser(is_disabled = !toggle)
        val disabled = sdk.ok<User>(sdk.update_user(id, body))
        assertEquals(!toggle, disabled.is_disabled)
        body = WriteUser(is_disabled = toggle)
        val enabled = sdk.ok<User>(sdk.update_user(id, body))
        assertEquals(toggle, enabled.is_disabled)
    }

    /**
     * Smoke: datetime value
     */
    @Test
    fun testSearchDashboard() {
        val dashboards = sdk.ok<Array<Dashboard>>(sdk.search_dashboards(limit = 1))
        assertNotNull(dashboards)
        assertEquals(1, dashboards.size)
        assertNotNull(dashboards.first().created_at)
    }

    /**
     * Smoke: POST, enum values
     */
    @Test
    fun testEnumProcessing() {
        val query = sdk.ok<Query>(sdk.create_query(simpleQuery()))
        query.id?.let { id ->
            val task = WriteCreateQueryTask(
                query_id = id,
                source = "test",
                result_format = ResultFormat.csv
            )
            val created = sdk.ok<QueryTask>(sdk.create_query_task(task))
            assertEquals(id, created.query_id, "Query id matches")
            assertEquals(ResultFormat.csv.toString(), created.result_format)
        }
    }

    /**
     * Smoke: DELETE
     */
    @Test
    fun testUserDeletion() {
        val user = prepUsers()
        var deleted = false
        try {
            sdk.ok<Unit>(sdk.delete_user(user.id!!))
            deleted = true
        } catch (e: java.lang.Error) {
            assertTrue(false, "$e.message")
        }
        assertEquals(true, deleted)
    }

    /**
     * Smoke: DelimArray
     */
    @Test
    fun testAllUsersWithIds() {
        prepUsers()
        val allUsers = sdk.ok<Array<User>>(sdk.all_users())
        val userIds: Array<String> = allUsers
            .map { u -> u.id!! }
            .take(2)
            .toTypedArray()
        val ids = DelimArray<String>(userIds)
        val users = sdk.ok<Array<User>>(sdk.all_users(ids = ids))
        assertEquals(2, users.size, "Should retrieve 2 users.")
        assertEquals(userIds[0], users[0].id)
        assertEquals(userIds[1], users[1].id)
    }

    /**
     * Smoke: PUT, and PUT/POST with no body
     */
    @Test
    fun testDefaultColorCollection() {
        val current = sdk.ok<ColorCollection>(sdk.default_color_collection())
        assertNotNull(current)
        val cols = sdk.ok<Array<ColorCollection>>(sdk.all_color_collections())
        assertNotNull(cols)
        val other = cols.find { c -> c.id !== current.id }
        assertNotNull(other)

        val actual = sdk.ok<ColorCollection>(sdk.set_default_color_collection(other.id!!))
        assertNotNull(actual)
        assertEquals(other.id, actual.id)
        val updated = sdk.ok<ColorCollection>(sdk.default_color_collection())
        assertNotNull(updated)
        assertEquals(other.id, actual.id)
        sdk.ok<ColorCollection>(sdk.set_default_color_collection(current.id!!))
    }

    /**
     * Smoke: ignore unknown json fields
     *
     * Call '/users' but deserialize it to [DummyUser] and test that unknown fields are ignored
     * during deserialization.
     */

    private fun get_dummy_users(): SDKResponse {
        return sdk.get<Array<DummyUser>>("/users")
    }

    @Test
    fun testIgnoreUnknownFields() {
        prepUsers()
        var received = false
        try {
            val users = sdk.ok<Array<DummyUser>>(get_dummy_users())
            assertNotNull(users[0].id)
            received = true
        } catch (e: java.lang.Error) {
            assertTrue(false, "$e.message")
        }
        assertEquals(true, received)
    }
}

/**
 * Dummy user data class based on [User] but with a subset of its properties.
 */
data class DummyUser(
    var id: Long? = null,
    var credentials_api3: Array<CredentialsApi3>? = null,
    var display_name: String? = null,
    var email: String? = null
) : Serializable
