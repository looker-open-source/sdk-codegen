import json
from operator import itemgetter
import pytest  # type: ignore
import re
from typing import Dict, List, Union

from looker_sdk.sdk import methods as mtds
from looker_sdk import models as ml


def test_crud_user(looker_client: mtds.LookerSDK):
    """Test creating, retrieving, updating and deleting a user.
    """

    # Create user
    user = looker_client.create_user(
        ml.WriteUser(first_name="John", last_name="Doe", is_disabled=True, locale="fr")
    )
    assert isinstance(user, ml.User)
    assert isinstance(user.id, int)
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert not user.is_disabled
    assert user.locale == "fr"

    # sudo checks
    user_id = user.id
    looker_client.login_user(user_id)
    user = looker_client.me()
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    looker_client.logout()
    user = looker_client.me()
    assert user.first_name != "John"
    assert user.last_name != "Doe"

    # Update user and check fields we didn't intend to change didn't change
    update_user = ml.WriteUser(is_disabled=True, locale="uk")
    looker_client.update_user(user_id, update_user)
    user = looker_client.user(user_id)
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.locale == "uk"
    assert user.is_disabled

    # Update user and check fields we intended to wipe out are now None
    # first way to specify nulling out a field
    update_user = ml.WriteUser(first_name=ml.EXPLICIT_NULL)  # type: ignore
    # second way
    update_user.last_name = None
    looker_client.update_user(user_id, update_user)
    user = looker_client.user(user_id)
    assert user.first_name is None
    assert user.last_name is None

    # Try adding email creds
    looker_client.create_user_credentials_email(
        user_id, ml.WriteCredentialsEmail(email="john.doe@looker.com")
    )
    user = looker_client.user(user_id)
    assert isinstance(user.credentials_email, ml.CredentialsEmail)
    assert user.credentials_email.email == "john.doe@looker.com"
    # Delete user
    resp = looker_client.delete_user(user_id)
    assert resp == ""


def test_me_returns_correct_result(looker_client: mtds.LookerSDK):
    """me() should return the right user
    """
    me = looker_client.me()
    assert isinstance(me, ml.User)
    assert isinstance(me.credentials_api3, list)
    assert len(me.credentials_api3) > 0
    assert isinstance(me.credentials_api3[0], ml.CredentialsApi3)


def test_me_field_filters(looker_client: mtds.LookerSDK):
    """me() should return only the requested fields.
    """
    me = looker_client.me("id, first_name, last_name")
    assert isinstance(me, ml.User)
    assert isinstance(me.id, int)
    assert isinstance(me.first_name, str)
    assert me.first_name != ""
    assert isinstance(me.last_name, str)
    assert me.last_name != ""
    assert not me.display_name
    assert not me.email
    assert not me.personal_space_id


@pytest.mark.usefixtures("test_users")  # type: ignore
def test_bad_user_search_returns_no_results(looker_client: mtds.LookerSDK):
    """search_users() should return an empty list when no match is found.
    """
    resp = looker_client.search_users(first_name="Bad", last_name="News")
    assert isinstance(resp, list)
    assert len(resp) == 0


@pytest.mark.usefixtures("test_users")  # type: ignore
def test_search_users_matches_email_dmain(
    looker_client: mtds.LookerSDK,
    test_data: Dict[str, Union[List[Dict[str, str]], str]],
):
    """search_users should return a list of all matches.
    """
    actual = looker_client.search_users_names(pattern=f"%{test_data['email_domain']}")
    assert len(actual) == len(test_data["users"])


@pytest.mark.usefixtures("test_users")  # type: ignore
def test_it_matches_email_domain_and_returns_sorted(
    looker_client: mtds.LookerSDK,
    test_data: Dict[str, Union[List[Dict[str, str]], str]],
):
    resp = looker_client.search_users_names(
        pattern=f"%{test_data['email_domain']}", sorts="last_name, first_name"
    )
    assert len(resp) == len(test_data["users"])
    sorted_test_data = sorted(
        test_data["users"], key=itemgetter("last_name", "first_name")
    )
    for actual, expected in zip(resp, sorted_test_data):
        assert actual.first_name == expected["first_name"]
        assert actual.last_name == expected["last_name"]


def test_it_retrieves_session(looker_client: mtds.LookerSDK):
    """session() should return the current session
    """
    resp = looker_client.session()
    assert resp.workspace_id == "production"


def test_it_updates_session(looker_client: mtds.LookerSDK):
    """update_session() should allow us to change the current workspace
    """
    # Switch workspace to dev mode
    looker_client.update_session(ml.WriteApiSession(workspace_id="dev"))
    resp = looker_client.session()

    assert isinstance(resp, ml.ApiSession)
    assert resp.workspace_id == "dev"

    # Switch workspace back to production
    resp = looker_client.update_session(ml.WriteApiSession(workspace_id="production"))

    assert isinstance(resp, ml.ApiSession)
    assert resp.workspace_id == "production"


def test_it_creates_and_runs_query(looker_client: mtds.LookerSDK, queries):
    # Create query hash
    for q in queries:
        limit = q["limit"] or "10"
        request = create_query_request(q, limit)
        query = looker_client.create_query(request)
        assert isinstance(query, ml.Query)
        assert query.id
        assert isinstance(query.id, int)
        assert query.id > 0

        sql = looker_client.run_query(query.id, "sql")
        assert "SELECT" in sql

        json_ = looker_client.run_query(query.id, "json")
        assert isinstance(json_, str)
        json_ = json.loads(json_)
        assert isinstance(json_, list)
        assert len(json_) == int(limit)
        row = json_[0]
        if q.get("fields", None):
            for field in q["fields"]:
                assert field in row.keys()

        csv = looker_client.run_query(query.id, "csv")
        assert isinstance(csv, str)
        assert len(re.findall(r"\n", csv)) == int(limit) + 1


def test_it_runs_inline_query(looker_client: mtds.LookerSDK, queries):
    for q in queries:
        limit = q["limit"] or "10"
        request = create_query_request(q, limit)

        json_ = looker_client.run_inline_query("json", request)
        assert isinstance(json_, str)
        json_ = json.loads(json_)
        assert len(json_) == int(limit)

        row = json_[0]
        if q.get("fields", None):
            for field in q["fields"]:
                assert field in row.keys()

        csv = looker_client.run_inline_query("csv", request)
        assert isinstance(csv, str)
        assert len(re.findall(r"\n", csv)) == int(limit) + 1


def test_search_looks_returns_looks(looker_client: mtds.LookerSDK):
    actual = looker_client.search_looks()
    assert isinstance(actual, list)
    assert len(actual) > 0
    look = actual[0]
    assert isinstance(look, ml.Look)
    assert look.title != ""
    assert look.created_at is not None


def test_search_looks_fields_filter(looker_client: mtds.LookerSDK):
    actual = looker_client.search_looks(fields="id, title, description")
    assert isinstance(actual, list)
    assert len(actual) > 0
    look = actual[0]
    assert isinstance(look, ml.Look)
    assert look.title is not None
    assert look.description is not None
    assert look.created_at is None


def test_search_looks_fields_filter(looker_client: mtds.LookerSDK):
    actual = looker_client.search_looks(title="Order%", fields="id, title")
    assert isinstance(actual, list)
    assert len(actual) > 0
    look = actual[0]
    assert isinstance(look.id, int)
    assert look.id > 0
    assert "Order" in look.title
    assert look.description is None


def create_query_request(q, limit=None):
    result = ml.WriteQuery(
        model=q.get("model", None),
        view=q.get("view", None),
        fields=q.get("fields", None),
        pivots=q.get("pivots", None),
        fill_fields=q.get("fill_fields", None),
        filters=q.get("filters", None),
        filter_expression=q.get("filter_expressions", None),
        sorts=q.get("sorts", None),
        limit=q.get("limit", None) or limit,
        column_limit=q.get("column_limit", None),
        total=q.get("total", None),
        row_total=q.get("row_total", None),
        subtotals=q.get("subtotal", None),
        runtime=q.get("runtime", None),
        vis_config=q.get("vis_config", None),
        filter_config=q.get("filter_config", None),
        visible_ui_sections=q.get("visible_ui_sections", None),
        dynamic_fields=q.get("dynamic_fields", None),
        client_id=q.get("client_id", None),
        query_timezone=q.get("query_timezone", None),
    )
    return result


def test_crud_dashboard(looker_client: mtds.LookerSDK, dashboards):

    for d in dashboards:
        d.setdefault("default")
        request = ml.WriteDashboard(
            description=d.get("description"),
            hidden=d.get("hidden"),
            query_timezone=d.get("query_timezone"),
            refresh_interval=d.get("refresh_interval"),
            title=d.get("title"),
            background_color=d.get("background_color"),
            load_configuration=d.get("load_configuration"),
            lookml_link_id=d.get("lookml_link_id"),
            show_filters_bar=d.get("show_filters_bar"),
            show_title=d.get("show_title"),
            slug=d.get("slug"),
            space_id=d.get("space_id") or looker_client.me().home_space_id,
            text_tile_text_color=d.get("text_tile_text_color"),
            tile_background_color=d.get("tile_background_color"),
            tile_text_color=d.get("tile_text_color"),
            title_color=d.get("title_color"),
        )
        dashboard = looker_client.create_dashboard(request)
        assert isinstance(dashboard, ml.Dashboard)

        if d.get("background_color"):
            assert dashboard.background_color

        if d.get("text_tile_text_color"):
            assert d["text_tile_text_color"] == dashboard.text_tile_text_color

        if d.get("tile_background_color"):
            assert d["tile_background_color"] == dashboard.tile_background_color

        if d.get("tile_text_color"):
            assert d["tile_text_color"] == dashboard.tile_text_color

        if d.get("title_color"):
            assert d["title_color"] == dashboard.title_color

        # Update dashboard
        actual = looker_client.update_dashboard(
            dashboard.id, ml.WriteDashboard(deleted=True)
        )
        assert actual.deleted
        assert actual.title == dashboard.title

        dashboard = looker_client.update_dashboard(
            dashboard.id, ml.WriteDashboard(deleted=False)
        )
        assert not dashboard.deleted

        if d.get("filters"):
            for f in d["filters"]:
                f.setdefault("default")
                filter = looker_client.create_dashboard_filter(
                    ml.WriteCreateDashboardFilter(
                        dashboard_id=dashboard.id,
                        name=f.get("name"),
                        title=f.get("title"),
                        type=f.get("type"),
                        default_value="foo",
                        model=f.get("model"),
                        explore=f.get("explore"),
                        dimension=f.get("dimension"),
                        row=f.get("row"),
                        listens_to_filters=f.get("listens_to_filters"),
                        allow_multiple_values=f.get("allow_multiple_values"),
                        required=f.get("required"),
                    )
                )
                assert isinstance(filter, ml.DashboardFilter)
                assert filter.name == f.get("name")
                assert filter.title == f.get("title")
                assert filter.type == f.get("type")
                assert filter.default_value == f.get("default_value")
                assert filter.model == f.get("model")
                assert filter.explore == f.get("explore")
                assert filter.dimension == f.get("dimension")
                assert filter.row == f.get("row")
                assert filter.listens_to_filters == f.get("listens_to_filters")
                assert filter.allow_multiple_values == f.get("allow_multiple_values")
                assert filter.required == f.get("required")

        # Delete dashboard
        resp = looker_client.delete_dashboard(dashboard.id)
        assert resp == ""
