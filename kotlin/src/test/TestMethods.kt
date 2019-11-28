import com.looker.rtl.*
import com.looker.sdk.*
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache.Apache
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import org.apache.http.conn.ssl.NoopHostnameVerifier
import org.apache.http.conn.ssl.TrustSelfSignedStrategy
import org.apache.http.ssl.SSLContextBuilder
import java.lang.Exception
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import org.junit.Test as test
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TestMethods {
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

    inline fun <TAll,TId, reified TEntity> listGetter(
            lister: () -> SDKResponse,
            getId: (item:TAll) -> TId,
            getEntity: (id:TId, fields: String?) -> SDKResponse,
            fields: String? = null,
            maxErrors: Int = 3
    ): String {
        val entityName = TEntity::class.simpleName!!
        val list = sdk.ok<Array<TAll>>(lister())
        var errors = StringBuilder("")
        var errorCount = 0
        assertNotEquals(list.count(), 0, "Got ${entityName}s")
        for (item in list) {
            getId(item).let { id ->
                try {
                    val actual = sdk.ok<TEntity>(getEntity(id, fields))
                } catch (e: Exception) {
                    if (++errorCount <= maxErrors) {
                        errors.append("Failed to get $entityName $id\nError: $e\n")
                    }
                }
            }
            if (errorCount > maxErrors) break
        }
        val result = errors.toString()
        assertEquals(errors.length, 0, result)
        return result
    }

    inline fun <TAll, TId, reified TEntity> testAll(
            lister: () -> SDKResponse,
            getId: (item:TAll) -> TId,
            getEntity: (id:TId, fields: String?) -> SDKResponse,
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

    @test fun testAllColorCollections() {
        listGetter<ColorCollection,String,ColorCollection>(
                {sdk.all_color_collections()},
                {item -> item.id!!},
                {id, fields->sdk.color_collection(id, fields)})
    }

    @test fun testAllConnections() {
        listGetter<DBConnection,String,DBConnection>(
                {sdk.all_connections()},
                {item -> item.name!!},
                {id, fields->sdk.connection(id, fields)})
    }

    @test fun testAllDataGroups() {
        // TODO does the get return exactly the same properties as the all function?
        listGetter<Datagroup,String,Datagroup>(
                {sdk.all_datagroups()},
                {item -> item.id!!.toString()},
                {id,_ -> sdk.datagroup(id)})
    }

    @test fun testAllDashboards() {
        testAll<DashboardBase,String,Dashboard>(
                {sdk.all_dashboards()},
                {item -> item.id!!},
                {id, fields -> sdk.dashboard(id, fields)},
                Safe.Dashboard)
    }

    @test fun testAllDialectInfos() {
        val list = sdk.ok<Array<DialectInfo>>(sdk.all_dialect_infos())
        assertNotEquals(list.count(), 0)
    }

    @test fun testAllFolders() {
        testAll<Folder,String,Folder>(
                {sdk.all_folders()},
                {item -> item.id!!},
                {id, fields -> sdk.folder(id, fields)})
    }

    @test fun testAllGroups() {
        listGetter<Group,Long,Group>(
                {sdk.all_groups()},
                {item -> item.id!!},
                {id, fields->sdk.group(id,fields)})
    }

    @test fun testAllHomepageItems() {
        listGetter<HomepageItem,Long,HomepageItem>(
                {sdk.all_homepage_items()},
                {item -> item.id!!.toLong()},
                {id, fields->sdk.homepage_item(id,fields)})
    }

    @test fun testAllHomepages() {
        listGetter<Homepage,Long,Homepage>(
                {sdk.all_homepages()},
                {item -> item.id!!.toLong()},
                {id, fields->sdk.homepage(id,fields)})
    }

    @test fun testAllHomepageSections() {
        listGetter<HomepageSection,Long,HomepageSection>(
                {sdk.all_homepage_sections()},
                {item -> item.id!!.toLong()},
                {id, fields->sdk.homepage_section(id,fields)})
    }

    @test fun testAllIntegrationHubs() {
        listGetter<IntegrationHub,Long,IntegrationHub>(
                {sdk.all_integration_hubs()},
                {item -> item.id!!.toLong()},
                {id, fields->sdk.integration_hub(id,fields)})
    }

    fun idToLong(id: String) : Long {
        val input = id.substringBefore(":", id)
        return input.toLong()
    }

    @test fun testAllIntegrations() {
        listGetter<Integration,Long,Integration>(
                {sdk.all_integrations()},
                {item -> idToLong(item.id!!)},
                {id, fields->sdk.integration(id,fields)})
    }

    @test fun testAllLegacyFeatures() {
        listGetter<LegacyFeature,Long,LegacyFeature>(
                {sdk.all_legacy_features()},
                {item -> item.id!!.toLong()},
                {id, _->sdk.legacy_feature(id)})
    }

    @test fun testAllLocales() {
        val list = sdk.ok<Array<Locale>>(sdk.all_locales())
        assertNotEquals(list.count(), 0)
    }

    @test fun testAllLookMLModels() {
        listGetter<LookmlModel,String,LegacyFeature>(
                {sdk.all_lookml_models()},
                {item -> item.name!!},
                {id, fields ->sdk.lookml_model(id, fields)})
    }

    @test fun testAllLooks() {
        testAll<Look,Long,LookWithQuery>(
                {sdk.all_looks()},
                {item -> item.id!!},
                {id, fields -> sdk.look(id, fields)},
                Safe.Look)
    }

    @test fun testAllModelSets() {
        testAll<ModelSet,Long,ModelSet>(
                {sdk.all_model_sets()},
                {item -> item.id!!},
                {id, fields -> sdk.model_set(id, fields)})
    }

    @test fun testAllPermissionSets() {
        testAll<PermissionSet,Long,PermissionSet>(
                {sdk.all_permission_sets()},
                {item -> item.id!!},
                {id, fields -> sdk.permission_set(id, fields)})
    }

    @test fun testAllPermissions() {
        val list = sdk.ok<Array<Permission>>(sdk.all_permissions())
        assertNotEquals(list.count(), 0)
    }

    @test fun testAllProjects() {
        testAll<Project,String,Project>(
                {sdk.all_projects()},
                {item -> item.id!!},
                {id, fields -> sdk.project(id, fields)})
    }

    @test fun testAllRoles() {
        testAll<Role,Long,Role>(
                {sdk.all_roles()},
                {item -> item.id!!},
                {id, _ -> sdk.role(id)})
    }

    @test fun testAllRunningQueries() {
        val list = sdk.ok<Array<RunningQueries>>(sdk.all_running_queries())
        assertNotEquals(list.count(), 0)
    }

    @test fun testAllSchedulePlans() {
        testAll<ScheduledPlan,Long,ScheduledPlan>(
                {sdk.all_scheduled_plans()},
                {item -> item.id!!},
                {id, fields -> sdk.scheduled_plan(id, fields)})
    }

    @test fun testAllSpaces() {
        testAll<SpaceBase,String,Space>(
                {sdk.all_spaces()},
                {item -> item.id!!},
                {id, fields -> sdk.space(id, fields)})
    }

    @test fun testAllThemes() {
        testAll<Theme,String,Theme>(
                {sdk.all_themes()},
                {item -> item.id!!.toString()},
                {id, fields -> sdk.theme(id, fields)})
    }

    @test fun testAllTimezones() {
        val list = sdk.ok<Array<Timezone>>(sdk.all_timezones())
        assertNotEquals(list.count(), 0)
    }

    @test fun testAllUserAttributes() {
        testAll<UserAttribute,Long,UserAttribute>(
                {sdk.all_user_attributes()},
                {item -> item.id!!},
                {id, fields -> sdk.user_attribute(id, fields)})
    }

    @test fun testAllUserLoginLockouts() {
        val list = sdk.ok<Array<UserLoginLockout>>(sdk.all_user_login_lockouts())
        assertNotEquals(list.count(), 0)
    }

    @test fun testAllUsers() {
        listGetter<User,Long,User>(
                {sdk.all_users()},
                {item -> item.id!!},
                {id, fields->sdk.user(id, fields)})
    }

    @test fun testAllWorkspaces() {
        testAll<Workspace,String,Workspace>(
                {sdk.all_workspaces()},
                {item -> item.id!!},
                {id, _ -> sdk.workspace(id)})
    }


}
