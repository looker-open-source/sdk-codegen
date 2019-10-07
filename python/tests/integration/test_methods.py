import io
import json
from operator import itemgetter
import re
from typing import Any, cast, Dict, List, Optional, Union

from PIL import Image
import pytest  # type: ignore

from looker_sdk.sdk import methods as mtds
from looker_sdk import models as ml


def test_crud_user(looker_client: mtds.LookerSDK):
    """Test creating, retrieving, updating and deleting a user.
    """

    # Create user
    user = looker_client.create_user(
        ml.WriteUser(first_name="John", last_name="Doe", is_disabled=False, locale="fr")
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
    update_user = ml.WriteUser(first_name=ml.EXPLICIT_NULL)
    # second way
    update_user.last_name = ml.EXPLICIT_NULL
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

    looker_client.logout()


def test_me_returns_correct_result(looker_client: mtds.LookerSDK):
    """me() should return the current authenticated user
    """
    me = looker_client.me()
    assert isinstance(me, ml.User)
    assert isinstance(me.credentials_api3, list)
    assert len(me.credentials_api3) > 0
    assert isinstance(me.credentials_api3[0], ml.CredentialsApi3)
    looker_client.logout()


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
    looker_client.logout()


@pytest.mark.usefixtures("test_users")
def test_bad_user_search_returns_no_results(looker_client: mtds.LookerSDK):
    """search_users() should return an empty list when no match is found.
    """
    resp = looker_client.search_users(first_name="Bad", last_name="News")
    assert isinstance(resp, list)
    assert len(resp) == 0
    looker_client.logout()


@pytest.mark.usefixtures("test_users")
def test_search_users_matches_pattern(
    looker_client: mtds.LookerSDK, users: List[Dict[str, str]], email_domain: str
):
    """search_users should return a list of all matches.
    """
    user = users[0]

    # Search by full email
    search_email = f'{user["first_name"]}.{user["last_name"]}{email_domain}'
    search_results = looker_client.search_users_names(pattern=search_email)
    assert len(search_results) == 1
    assert search_results[0].first_name == user["first_name"]
    assert search_results[0].last_name == user["last_name"]
    assert search_results[0].email == search_email

    # Search by first name
    search_results = looker_client.search_users_names(pattern=user["first_name"])
    assert len(search_results) > 0
    assert search_results[0].first_name == user["first_name"]

    # First name with spaces
    u = looker_client.create_user(
        ml.WriteUser(first_name="John Allen", last_name="Smith")
    )
    if u.id:
        search_results = looker_client.search_users_names(pattern="John Allen")
        assert len(search_results) == 1
        assert search_results[0].first_name == "John Allen"
        assert search_results[0].last_name == "Smith"

        # Delete user
        resp = looker_client.delete_user(u.id)
        assert resp == ""

    looker_client.logout()


@pytest.mark.usefixtures("test_users")
def test_it_matches_email_domain_and_returns_sorted(
    looker_client: mtds.LookerSDK, email_domain: str, users: List[Dict[str, str]]
):
    """search_users_names() should search users matching a given pattern and return
    sorted results if sort fields are specified.
    """
    search_results = looker_client.search_users_names(
        pattern=f"%{email_domain}", sorts="last_name, first_name"
    )
    assert len(search_results) == len(users)
    sorted_test_data: List[Dict[str, str]] = sorted(
        users, key=itemgetter("last_name", "first_name")
    )
    for actual, expected in zip(search_results, sorted_test_data):
        assert actual.first_name == expected["first_name"]
        assert actual.last_name == expected["last_name"]
    looker_client.logout()


@pytest.mark.usefixtures("test_users")
def test_delim_sequence(
    looker_client: mtds.LookerSDK, email_domain: str, users: List[Dict[str, str]]
):
    search_results = looker_client.search_users_names(pattern=f"%{email_domain}")
    assert len(search_results) == len(users)
    delim_ids = ml.DelimSequence([cast(int, u.id) for u in search_results])
    all_users = looker_client.all_users(ids=delim_ids)
    assert len(all_users) == len(users)
    looker_client.logout()


def test_it_retrieves_session(looker_client: mtds.LookerSDK):
    """session() should return the current session.
    """
    current_session = looker_client.session()
    assert current_session.workspace_id == "production"
    looker_client.logout()


def test_it_updates_session(looker_client: mtds.LookerSDK):
    """update_session() should allow us to change the current workspace.
    """
    # Switch workspace to dev mode
    looker_client.update_session(ml.WriteApiSession(workspace_id="dev"))
    current_session = looker_client.session()

    assert isinstance(current_session, ml.ApiSession)
    assert current_session.workspace_id == "dev"

    # Switch workspace back to production
    current_session = looker_client.update_session(
        ml.WriteApiSession(workspace_id="production")
    )

    assert isinstance(current_session, ml.ApiSession)
    assert current_session.workspace_id == "production"

    looker_client.logout()


TQueries = List[Dict[str, Union[str, List[str], Dict[str, str]]]]


def test_it_creates_and_runs_query(looker_client: mtds.LookerSDK, queries: TQueries):
    """create_query() creates a query and run_query() returns its result.
    """
    for q in queries:
        limit = cast(str, q["limit"]) or "10"
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
        if q.get("fields"):
            for field in q["fields"]:
                assert field in row.keys()

        csv = looker_client.run_query(query.id, "csv")
        assert isinstance(csv, str)
        assert len(re.findall(r"\n", csv)) == int(limit) + 1

        looker_client.logout()


def test_it_runs_inline_query(looker_client: mtds.LookerSDK, queries: TQueries):
    """run_inline_query() should run a query and return its results.
    """
    for q in queries:
        limit = cast(str, q["limit"]) or "10"
        request = create_query_request(q, limit)

        json_resp = looker_client.run_inline_query("json", request)
        assert isinstance(json_resp, str)
        json_: List[Dict[str, Any]] = json.loads(json_resp)
        assert len(json_) == int(limit)

        row = json_[0]
        if q.get("fields"):
            for field in q["fields"]:
                assert field in row.keys()

        csv = looker_client.run_inline_query("csv", request)
        assert isinstance(csv, str)
        assert len(re.findall(r"\n", csv)) == int(limit) + 1

    # only do 1 image download since it takes a while
    png = looker_client.run_inline_query("png", request)
    assert isinstance(png, bytes)
    try:
        Image.open(io.BytesIO(png))
    except IOError:
        raise AssertionError("png format failed to return an image")

    looker_client.logout()


def test_search_looks_returns_looks(looker_client: mtds.LookerSDK):
    """search_looks() should return a list of looks.
    """
    search_results = looker_client.search_looks()
    assert isinstance(search_results, list)
    assert len(search_results) > 0
    look = search_results[0]
    assert isinstance(look, ml.Look)
    assert look.title != ""
    assert look.created_at is not None
    looker_client.logout()


def test_search_looks_fields_filter(looker_client: mtds.LookerSDK):
    """search_looks() should only return the requested fields passed in the fields
    argument of the request.
    """
    search_results = looker_client.search_looks(fields="id, title, description")
    assert isinstance(search_results, list)
    assert len(search_results) > 0
    look = search_results[0]
    assert isinstance(look, ml.Look)
    assert look.title is not None
    assert look.created_at is None
    looker_client.logout()


def test_search_looks_title_fields_filter(looker_client: mtds.LookerSDK):
    """search_looks() should be able to filter on title.
    """
    search_results = looker_client.search_looks(title="Order%", fields="id, title")
    assert isinstance(search_results, list)
    assert len(search_results) > 0
    look = search_results[0]
    assert isinstance(look.id, int)
    assert look.id > 0
    assert "Order" in look.title
    assert look.description is None
    looker_client.logout()


def create_query_request(q, limit: Optional[str] = None) -> ml.WriteQuery:
    return ml.WriteQuery(
        model=q.get("model"),
        view=q.get("view"),
        fields=q.get("fields"),
        pivots=q.get("pivots"),
        fill_fields=q.get("fill_fields"),
        filters=q.get("filters"),
        filter_expression=q.get("filter_expressions"),
        sorts=q.get("sorts"),
        limit=q.get("limit") or limit,
        column_limit=q.get("column_limit"),
        total=q.get("total"),
        row_total=q.get("row_total"),
        subtotals=q.get("subtotal"),
        runtime=q.get("runtime"),
        vis_config=q.get("vis_config"),
        filter_config=q.get("filter_config"),
        visible_ui_sections=q.get("visible_ui_sections"),
        dynamic_fields=q.get("dynamic_fields"),
        client_id=q.get("client_id"),
        query_timezone=q.get("query_timezone"),
    )


@pytest.mark.usefixtures("remove_test_dashboards")
def test_crud_dashboard(looker_client: mtds.LookerSDK, queries, dashboards):
    """Test creating, retrieving, updating and deleting a user.
    """
    qhash: Dict[Union[str, int], ml.Query] = {}
    for idx, q in enumerate(queries):
        limit = "10"
        request = create_query_request(q, limit)
        key = q.get("id") or str(idx)
        qhash[key] = looker_client.create_query(request)

    for d in dashboards:
        dashboard = looker_client.create_dashboard(
            ml.WriteDashboard(
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
        )

        assert isinstance(dashboard, ml.Dashboard)

        if d.get("background_color"):
            assert d["background_color"] == dashboard.background_color

        if d.get("text_tile_text_color"):
            assert d["text_tile_text_color"] == dashboard.text_tile_text_color

        if d.get("tile_background_color"):
            assert d["tile_background_color"] == dashboard.tile_background_color

        if d.get("tile_text_color"):
            assert d["tile_text_color"] == dashboard.tile_text_color

        if d.get("title_color"):
            assert d["title_color"] == dashboard.title_color

        # Update dashboard
        assert isinstance(dashboard.id, str)
        update_response = looker_client.update_dashboard(
            dashboard.id, ml.WriteDashboard(deleted=True)
        )
        assert update_response.deleted
        assert update_response.title == dashboard.title

        dashboard = looker_client.update_dashboard(
            dashboard.id, ml.WriteDashboard(deleted=False)
        )
        assert isinstance(dashboard.id, str)
        assert not dashboard.deleted

        if d.get("filters"):
            for f in d["filters"]:
                filter = looker_client.create_dashboard_filter(
                    ml.WriteCreateDashboardFilter(
                        dashboard_id=dashboard.id,
                        name=f.get("name"),
                        title=f.get("title"),
                        type=f.get("type"),
                        default_value=f.get("default_value"),
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
                assert filter.allow_multiple_values == f.get(
                    "allow_multiple_values", False
                )
                assert filter.required == f.get("required", False)

        if d.get("tiles"):
            for t in d["tiles"]:
                tile = looker_client.create_dashboard_element(
                    ml.WriteDashboardElement(
                        body_text=t.get("body_text"),
                        dashboard_id=dashboard.id,
                        look=t.get("look"),
                        look_id=t.get("look_id"),
                        merge_result_id=t.get("merge_result_id"),
                        note_display=t.get("note_display"),
                        note_state=t.get("note_state"),
                        note_text=t.get("note_text"),
                        query=t.get("query"),
                        query_id=get_query_id(qhash, t.get("query_id")),
                        refresh_interval=t.get("refresh_interval"),
                        subtitle_text=t.get("subtitle_text"),
                        title=t.get("title"),
                        title_hidden=t.get("title_hidden"),
                        type=t.get("type"),
                    )
                )

                assert isinstance(tile, ml.DashboardElement)
                assert tile.dashboard_id == dashboard.id
                assert tile.title == t.get("title")
                assert tile.type == t.get("type")

    looker_client.logout()


def get_query_id(
    qhash: Dict[Union[str, int], ml.Query], id: Union[str, int]
) -> Optional[int]:
    if isinstance(id, str) and id.startswith("#"):
        id = id[1:]
        # if id is invalid, default to first query. test data is bad
        query = qhash.get(id) or list(qhash.values())[0]
        query_id = query.id
    elif (isinstance(id, str) and id.isdigit()) or isinstance(id, int):
        query_id = int(id)
    else:
        query_id = None
    return query_id
