
import com.looker.rtl.SDKResponse
import com.looker.sdk.*
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import org.junit.Test as test

class TestMethods {
    val sdk by lazy { TestConfig().sdk }

    private inline fun <TAll, TId, reified TEntity : Any> listGetter(
        lister: () -> SDKResponse,
        getId: (item: TAll) -> TId,
        getEntity: (id: TId, fields: String?) -> SDKResponse,
        fields: String? = null,
        maxErrors: Int = 3
    ): String {
        val entityName = TEntity::class.simpleName!!
        val list = sdk.ok<Array<TAll>>(lister())
        val errors = StringBuilder("")
        var errorCount = 0
        assertNotEquals(0, list.count(), "Got ${entityName}s")
        for (item in list) {
            getId(item).let { id ->
                try {
                    val actual = sdk.ok<TEntity>(getEntity(id, fields))
                    assertNotNull(actual, "$entityName $id should be assigned")
                } catch (e: Exception) {
                    if (errorCount++ <= maxErrors) {
                        errors.append("Failed to get $entityName $id\nError: $e\n")
                    } else {
                        // do nothing, but avoid Kotlin linter complaints I don't understand
                    }
                }
            }
            if (errorCount > maxErrors) break
        }
        val result = errors.toString()
        if (errors.isNotEmpty()) {
            assertEquals(0, errors.length, result)
        }
        return result
    }

    private inline fun <TAll, TId, reified TEntity : Any> testAll(
        lister: () -> SDKResponse,
        getId: (item: TAll) -> TId,
        getEntity: (id: TId, fields: String?) -> SDKResponse,
        fields: String? = null,
        maxErrors: Int = 3
    ) {
        val entityName = TEntity::class.simpleName!!
        var result = listGetter<TAll, TId, TEntity>(lister, getId, getEntity, null, maxErrors)
        if (result !== "" && fields !== null) {
            print("Safely getting $entityName ...\n")
            result = listGetter<TAll, TId, TEntity>(lister, getId, getEntity, fields, maxErrors)
            if (result == "") {
                print("Safely got all $entityName entries\n")
            }
        }
    }

    private fun simpleQuery(): WriteQuery {
        return WriteQuery(
            "system__activity",
            "dashboard",
            arrayOf("dashboard.id", "dashboard.title", "dashboard.count"),
            limit = "100"
        )
    }

    private fun slowQuery(): WriteQuery {
        return WriteQuery(
            "system__activity",
            "dashboard",
            arrayOf("dashboard.id", "dashboard.title", "dashboard.count"),
            limit = "5000"
        )
    }

    /*
    Functions to prepare any data entities that might be missing for testing retrieval and iteration
     */
    private fun prepLook(): Look {
        val items = sdk.ok<Array<Look>>(sdk.all_looks())
        if (items.count() > 0) {
            return items.first()
        }
        val look = sdk.ok<Look>(
            sdk.create_look(
                WriteLookWithQuery(
                    description = "SDK Look",
                    query = simpleQuery()
                )
            )
        )
        print("Prepared Look ${look.id}")
        return look
    }

    private fun prepDashboard(): Dashboard {
        val items: Array<DashboardBase> = sdk.ok(sdk.all_dashboards("id"))
        if (items.count() > 0) {
            val base = items.first()
            return sdk.ok(sdk.dashboard(base.id!!))
        }
        val dashboard = sdk.ok<Dashboard>(
            sdk.create_dashboard(
                WriteDashboard(
                    description = "SDK Dashboard",
                    title = "SDK Dashboard Title",
                    show_title = true
                )
            )
        )
        print("Prepared Dashboard ${dashboard.id}")
        return dashboard
    }

    private fun prepBoard(): Board {
        val items = sdk.ok<Array<Board>>(sdk.all_boards())
        if (items.count() > 0) {
            return items.first()
        }
        val look = prepLook()
        val board = sdk.ok<Board>(
            sdk.create_board(
                WriteBoard(
                    description = "SDK board description",
                    title = "SDK Board"
                )
            )
        )

        val section = sdk.ok<BoardSection>(
            sdk.create_board_section(
                WriteBoardSection(
                    board_id = board.id!!.toLong(),
                    description = "SDK section"
                )
            )
        )
        val item = sdk.ok<BoardItem>(
            sdk.create_board_item(
                WriteBoardItem(
                    board_section_id = section.id,
                    look_id = look.id
                )
            )
        )
        print("Prepared Board ${board.id} Section ${section.id} Item ${item.id} with Look ${look.id}")
        return board
    }

    val scheduleName = "SDK plans and schemes"

    private fun prepScheduledPlan(): ScheduledPlan {
        val items = sdk.ok<Array<ScheduledPlan>>(sdk.all_scheduled_plans())
        if (items.count() > 0) {
            return items.first()
        }
        val look = prepLook()
        val destinations = arrayOf(
            ScheduledPlanDestination(
                type = "sftp",
                format = "csv",
                address = "sftp://example",
                secret_parameters = "{\"password\":\"secret\"}",
                parameters = "{\"username\":\"name\"}"
            )
        )

        val plan = sdk.ok<ScheduledPlan>(
            sdk.create_scheduled_plan(
                WriteScheduledPlan(
                    name = scheduleName,
                    look_id = look.id!!.toLong(),
                    require_change = false,
                    require_no_results = false,
                    require_results = true,
                    timezone = "America/Los_Angeles",
                    crontab = "*/1440 * * * *",
                    enabled = true, // Plan must be enabled to be retrieved by `all_scheduled_plans`
                    scheduled_plan_destination = destinations
                )
            )
        )
        print("Prepared scheduled plan ${plan.id}")
        return plan
    }

    private fun clearScheduledPlan() {
        val items = sdk.ok<Array<ScheduledPlan>>(sdk.all_scheduled_plans())
        if (items.count() > 0) {
            val sked: ScheduledPlan? = items.find { p -> p.name == scheduleName }
            sked?.let { plan ->
                sdk.ok<Boolean>(sdk.delete_scheduled_plan(plan.id!!))
                print("Cleared scheduled plan ${plan.id!!}")
            }
        }
    }

    // TODO resurrect this when the bug is fixed
/*
    @test
    fun testImageDownload() {
        val body = simpleQuery()
        val query = sdk.ok<Query>(sdk.create_query(body))
        query.id?.let { id ->
            // sanity check to make sure the query is valid first
            val sql = sdk.ok<String>(sdk.run_query(id, "sql"))
            assertNotNull(sql)
            assertTrue(sql.contains("SELECT"), "Select statement returned")
            val png = sdk.ok<ByteArray>(sdk.stream.run_query(id, "png")).toUByteArray()
            assertNotNull(png)
            assertEquals("image/png", mimeType(png), "png is png?")
            val jpg = sdk.ok<ByteArray>(sdk.stream.run_query(id, "jpg")).toUByteArray()
            assertNotNull(jpg)
            assertNotEquals(png, jpg, "We should not be getting the same image")
            assertEquals("image/jpeg", mimeType(jpg), "image/jpeg should be returned, not image/png. Definitely an API bug, not SDK")
        }
    }
*/

    /*
    functional tests
     */

    @test
    fun testMe() {
        val me = sdk.ok<User>(sdk.me())
        val creds = me.credentials_api3
        assertNotNull(me)
        assertNotNull(me.id)
        assertNotNull(creds)
        assertNotEquals(0, creds.count(), "We should have some credentials for the API user")
        assertNotNull(creds[0].client_id)
    }

    @test
    fun testCreateQuery() {
        val query = sdk.ok<Query>(sdk.create_query(simpleQuery()))
        query.id?.let { id ->
            val result = sdk.ok<String>(sdk.run_query(id, "sql"))
            assertTrue(result.startsWith("SELECT"))
        }
    }

    @test
    fun testSearchDashboards() {
        val search = sdk.ok<Array<Dashboard>>(sdk.search_dashboards(limit = 3))
        assertNotNull(search)
    }

    @test
    fun testRunInlineQuery() {
        val result = sdk.ok<String>(
            sdk.run_inline_query("csv", simpleQuery())
        )
        assertTrue(result.contains("Dashboard ID"))
    }

    @test
    fun testAllColorCollections() {
        listGetter<ColorCollection, String, ColorCollection>(
            { sdk.all_color_collections() },
            { item -> item.id!! },
            { id, fields -> sdk.color_collection(id, fields) }
        )
    }

    @test
    fun testAllConnections() {
        listGetter<DBConnection, String, DBConnection>(
            { sdk.all_connections() },
            { item -> item.name!! },
            { id, fields -> sdk.connection(id, fields) }
        )
    }

    @test
    fun testAllDataGroups() {
        listGetter<Datagroup, Long, Datagroup>(
            { sdk.all_datagroups() },
            { item -> item.id!! },
            { id, _ -> sdk.datagroup(id) }
        )
    }

    @test
    fun testAllDashboards() {
        prepDashboard()
        testAll<DashboardBase, String, Dashboard>(
            { sdk.all_dashboards() },
            { item -> item.id!! },
            { id, fields -> sdk.dashboard(id, fields) }
        )
    }

    @test
    fun testAllDialectInfos() {
        val list = sdk.ok<Array<DialectInfo>>(sdk.all_dialect_infos())
        assertNotEquals(0, list.count(), "Expected dialects")
    }

    @test
    fun testAllFolders() {
        testAll<Folder, String, Folder>(
            { sdk.all_folders() },
            { item -> item.id!! },
            { id, fields -> sdk.folder(id, fields) }
        )
    }

    @test
    fun testAllGroups() {
        listGetter<Group, Long, Group>(
            { sdk.all_groups() },
            { item -> item.id!! },
            { id, fields -> sdk.group(id, fields) }
        )
    }

    @test
    fun testAllBoardItems() {
        prepBoard()
        listGetter<BoardItem, Long, BoardItem>(
            { sdk.all_board_items() },
            { item -> item.id!!.toLong() },
            { id, fields -> sdk.board_item(id, fields) }
        )
    }

    @test
    fun testSearchBoards() {
        val searched = sdk.ok<Array<Board>>(sdk.search_boards(title = "%"))
        assertNotNull(searched)
        assertNotEquals(0, searched.count(), "There should be boards")
    }

    @test
    fun testAllBoards() {
        prepBoard()
        listGetter<Board, Long, Board>(
            { sdk.all_boards() },
            { item -> item.id!!.toLong() },
            { id, fields -> sdk.board(id, fields) }
        )
    }

    @test
    fun testAllBoardSections() {
        prepBoard()
        listGetter<BoardSection, Long, BoardSection>(
            { sdk.all_board_sections() },
            { item -> item.id!!.toLong() },
            { id, fields -> sdk.board_section(id, fields) }
        )
    }

    @test
    fun testAllIntegrationHubs() {
        listGetter<IntegrationHub, Long, IntegrationHub>(
            { sdk.all_integration_hubs() },
            { item -> item.id!!.toLong() },
            { id, fields -> sdk.integration_hub(id, fields) }
        )
    }

    @test
    fun testAllIntegrations() {
        listGetter<Integration, String, Integration>(
            { sdk.all_integrations() },
            { item -> item.id!! },
            { id, fields -> sdk.integration(id, fields) }
        )
    }

    @test
    fun testAllLegacyFeatures() {
        listGetter<LegacyFeature, String, LegacyFeature>(
            { sdk.all_legacy_features() },
            { item -> item.id!! },
            { id, _ -> sdk.legacy_feature(id) }
        )
    }

    @test
    fun testAllLocales() {
        val list = sdk.ok<Array<Locale>>(sdk.all_locales())
        assertNotEquals(0, list.count(), "Expected locales")
    }

    @test
    fun testAllLookMLModels() {
        testAll<LookmlModel, String, LookmlModel>(
            { sdk.all_lookml_models() },
            { item -> item.name!! },
            { id, fields -> sdk.lookml_model(id, fields) }
        )
    }

    @test
    fun testAllLooks() {
        prepLook()
        testAll<Look, Long, LookWithQuery>(
            { sdk.all_looks() },
            { item -> item.id!! },
            { id, fields -> sdk.look(id, fields) }
        )
    }

    @test
    fun testAllModelSets() {
        testAll<ModelSet, Long, ModelSet>(
            { sdk.all_model_sets() },
            { item -> item.id!! },
            { id, fields -> sdk.model_set(id, fields) }
        )
    }

    @test
    fun testAllPermissionSets() {
        testAll<PermissionSet, Long, PermissionSet>(
            { sdk.all_permission_sets() },
            { item -> item.id!! },
            { id, fields -> sdk.permission_set(id, fields) }
        )
    }

    @test
    fun testAllPermissions() {
        val list = sdk.ok<Array<Permission>>(sdk.all_permissions())
        assertNotEquals(0, list.count(), "Expected permissions")
    }

    @test
    fun testAllProjects() {
        testAll<Project, String, Project>(
            { sdk.all_projects() },
            { item -> item.id!! },
            { id, fields -> sdk.project(id, fields) }
        )
    }

    @test
    fun testAllRoles() {
        testAll<Role, Long, Role>(
            { sdk.all_roles() },
            { item -> item.id!! },
            { id, _ -> sdk.role(id) }
        )
    }

// TODO figure out a reliable way to queue up some running queries
//    @test fun testAllRunningQueries() {
//        var running = false
//        GlobalScope.launch {
//            running = true
//            val json = sdk.ok<String>(sdk.run_inline_query("json_detail", slowQuery()))
//            print("slow query complete")
//            running = false
//            assertNotNull(json)
//        }
//        var tries = 0
//        var list: Array<RunningQueries>
//        do {
//            list = sdk.ok(sdk.all_running_queries())
//            Thread.sleep(100L) // block main thread to ensure query is running
//        } while (running && list.count() == 0 && tries++ < 99)
// //        assertEquals(running, false, "Running should have completed")
//        assertNotEquals(list.count(), 0, "List should have at least one query")
//    }

    @test
    fun testAllSchedulePlans() {
        prepScheduledPlan()
        testAll<ScheduledPlan, Long, ScheduledPlan>(
            { sdk.all_scheduled_plans() },
            { item -> item.id!! },
            { id, fields -> sdk.scheduled_plan(id, fields) }
        )
        clearScheduledPlan()
    }

    @test
    fun testAllThemes() {
        testAll<Theme, Long, Theme>(
            { sdk.all_themes() },
            { item -> item.id!! },
            { id, fields -> sdk.theme(id, fields) }
        )
    }

    @test
    fun testAllTimezones() {
        val list = sdk.ok<Array<Timezone>>(sdk.all_timezones())
        assertNotEquals(0, list.count(), "Expected timezones")
    }

    @test
    fun testAllUserAttributes() {
        testAll<UserAttribute, Long, UserAttribute>(
            { sdk.all_user_attributes() },
            { item -> item.id!! },
            { id, fields -> sdk.user_attribute(id, fields) }
        )
    }

    @test
    fun testAllUserLoginLockouts() {
        val list = sdk.ok<Array<UserLoginLockout>>(sdk.all_user_login_lockouts())
        if (list.count() > 0) {
            assertNotNull(list.first())
        }
    }

    @test
    fun testAllUsers() {
        testAll<User, Long, User>(
            { sdk.all_users() },
            { item -> item.id!! },
            { id, fields -> sdk.user(id, fields) }
        )
    }

    @test
    fun testErrorHandling() {
        try {
            sdk.ok<Array<Look>>(sdk.look(-1))
            assertTrue(false, "We shouldn't get here")
        } catch (e: java.lang.Error) {
            assertTrue(e.toString().contains("GET /looks/-1"))
        }
    }

    @test
    fun testAllWorkspaces() {
        testAll<Workspace, String, Workspace>(
            { sdk.all_workspaces() },
            { item -> item.id!! },
            { id, _ -> sdk.workspace(id) }
        )
    }
}
