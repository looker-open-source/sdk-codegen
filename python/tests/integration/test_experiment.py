import datetime
import io
import json
import re
from operator import itemgetter
from typing import Any, cast, Dict, List, Optional, Union, Sequence

import pytest  # type: ignore
from PIL import Image  # type: ignore

from looker_sdk.sdk.api40 import methods as mtds
from looker_sdk.sdk.api40 import models as ml


@pytest.fixture(scope="module")
def sdk(sdk40) -> mtds.Looker40SDK:
    return sdk40


TEST_FIRST_NAME = "Rudolphontronix"
TEST_LAST_NAME = "Doe"


def test_crud_user(sdk: mtds.Looker40SDK):
    """Test creating, retrieving, updating and deleting a user."""

    # Create user
    user = sdk.create_user(
        ml.WriteUser(
            first_name=TEST_FIRST_NAME,
            last_name=TEST_LAST_NAME,
            is_disabled=False,
            locale="fr",
        )
    )
    assert isinstance(user, ml.User)
    assert isinstance(user.id, str)
    assert user.first_name == TEST_FIRST_NAME
    assert user.last_name == TEST_LAST_NAME
    assert not user.is_disabled
    assert user.locale == "fr"

    # sudo checks
    user_id = user.id
    sudo_auth = sdk.login_user(user_id)
    assert isinstance(sudo_auth.access_token, str)
    assert sudo_auth.access_token != ""
    sdk.auth.login_user(user_id)
    user = sdk.me()
    assert user.first_name == TEST_FIRST_NAME
    assert user.last_name == TEST_LAST_NAME
    sdk.auth.logout()
    user = sdk.me()
    assert user.first_name != TEST_FIRST_NAME
    assert user.last_name != TEST_LAST_NAME

    # Update user and check fields we didn't intend to change didn't change
    update_user = ml.WriteUser(is_disabled=True, locale="uk")
    sdk.update_user(user_id, update_user)
    user = sdk.user(user_id)
    assert user.first_name == TEST_FIRST_NAME
    assert user.last_name == TEST_LAST_NAME
    assert user.locale == "uk"
    assert user.is_disabled

    # Update user and check fields we intended to wipe out are now None
    # first way to specify nulling out a field
    update_user = ml.WriteUser(first_name=ml.EXPLICIT_NULL)
    # second way
    update_user.last_name = ml.EXPLICIT_NULL
    sdk.update_user(user_id, update_user)
    user = sdk.user(user_id)
    assert user.first_name == ""
    assert user.last_name == ""

    # Try adding email creds
    sdk.create_user_credentials_email(
        user_id, ml.WriteCredentialsEmail(email="john.doe@looker.com")
    )
    user = sdk.user(user_id)
    assert isinstance(user.credentials_email, ml.CredentialsEmail)
    assert user.credentials_email.email == "john.doe@looker.com"

    # Delete user
    resp = sdk.delete_user(user_id)
    assert resp == ""


def test_crud_user_dict(sdk):  # no typing
    """Test creating, retrieving, updating and deleting a user."""

    # Create user
    new_user = sdk.create_user(
        dict(
            first_name=TEST_FIRST_NAME,
            last_name=TEST_LAST_NAME,
            is_disabled=False,
            locale="fr",
        )
    )
    assert new_user["first_name"] == TEST_FIRST_NAME
    assert new_user["last_name"] == TEST_LAST_NAME
    assert not new_user["is_disabled"]
    assert new_user["locale"] == "fr"

    # sudo checks
    user_id = new_user["id"]
    sdk.auth.login_user(user_id)
    sudo_user = sdk.me()
    assert sudo_user["first_name"] == TEST_FIRST_NAME
    assert sudo_user["last_name"] == TEST_LAST_NAME
    sdk.auth.logout()
    me_user = sdk.me()
    assert me_user["first_name"] != TEST_FIRST_NAME
    assert me_user["last_name"] != TEST_LAST_NAME

    # Update user and check fields we didn't intend to change didn't change
    new_user["is_disabled"] = True
    new_user["locale"] = "uk"
    # sdk.update_user(user_id, update_user)
    sdk.update_user(user_id, new_user)
    updated_user = sdk.user(user_id)
    assert updated_user["first_name"] == TEST_FIRST_NAME
    assert updated_user["last_name"] == TEST_LAST_NAME
    assert updated_user["locale"] == "uk"
    assert updated_user["is_disabled"]

    update_user = dict(first_name=None)
    update_user["last_name"] = None
    sdk.update_user(user_id, update_user)
    user = sdk.user(user_id)
    assert user["first_name"] == ""
    assert user["last_name"] == ""

    # Try adding email creds
    sdk.create_user_credentials_email(user_id, dict(email="john.doe@looker.com"))
    user = sdk.user(user_id)
    assert user["credentials_email"]["email"] == "john.doe@looker.com"

    # Delete user
    resp = sdk.delete_user(user_id)
    assert resp == ""


def test_me_returns_correct_result(sdk: mtds.Looker40SDK):
    """me() should return the current authenticated user"""
    me = sdk.me()
    assert isinstance(me, ml.User)
    assert isinstance(me.credentials_api3, list)
    assert len(me.credentials_api3) > 0
    assert isinstance(me.credentials_api3[0], ml.CredentialsApi3)


def test_me_field_filters(sdk: mtds.Looker40SDK):
    """me() should return only the requested fields."""
    me = sdk.me("id, first_name, last_name")
    assert isinstance(me, ml.User)
    assert isinstance(me.id, str)
    assert isinstance(me.first_name, str)
    assert me.first_name != ""
    assert isinstance(me.last_name, str)
    assert me.last_name != ""
    assert not me.display_name
    assert not me.email
    assert not me.personal_folder_id


# @pytest.mark.usefixtures("test_users")
# def test_bad_user_search_returns_no_results(sdk: mtds.Looker40SDK):
#     """search_users() should return an empty list when no match is found."""
#     resp = sdk.search_users(first_name="Bad", last_name="News")
#     assert isinstance(resp, list)
#     assert len(resp) == 0


# @pytest.mark.usefixtures("test_users")
# def test_search_users_matches_pattern(
#     sdk: mtds.Looker40SDK, users: List[Dict[str, str]], email_domain: str
# ):
#     """search_users should return a list of all matches."""
#     user = users[0]

#     # Search by full email
#     search_email = f'{user["first_name"]}.{user["last_name"]}{email_domain}'
#     search_results = sdk.search_users_names(pattern=search_email)
#     assert len(search_results) == 1
#     assert search_results[0].first_name == user["first_name"]
#     assert search_results[0].last_name == user["last_name"]
#     assert search_results[0].email == search_email

#     # Search by first name
#     search_results = sdk.search_users_names(pattern=user["first_name"])
#     assert len(search_results) > 0
#     assert search_results[0].first_name == user["first_name"]

#     # First name with spaces
#     u = sdk.create_user(ml.WriteUser(first_name="John Allen", last_name="Smith"))
#     if u.id:
#         search_results = sdk.search_users_names(pattern="John Allen")
#         assert len(search_results) == 1
#         assert search_results[0].first_name == "John Allen"
#         assert search_results[0].last_name == "Smith"

#         # Delete user
#         resp = sdk.delete_user(u.id)
#         assert resp == ""


def test_csv_user_id_list(sdk: mtds.Looker40SDK):
    """all_users() should accept a delimited array of ids."""
    users = sdk.all_users()
    assert len(users) > 1
    ids = [user.id for user in users]
    all_users = sdk.all_users(ids=ml.DelimSequence(cast(Sequence[int], ids)))
    assert len(all_users) == len(users)


def test_enum(sdk: mtds.Looker40SDK):
    # TODO: there is currently no example in the Looker API of a "bare"
    # ForwardRef property on a model that is returned by the API. We
    # have unittests deserializing into "bare" ForwardRef properties,
    # that will have to do for now.
    query = ml.WriteQuery(
        model="system__activity",
        view="dashboard",
        fields=["dashboard.id", "dashboard.title", "dashboard.count"],
    )
    query_id = sdk.create_query(query).id
    assert query_id
    task = ml.WriteCreateQueryTask(
        query_id=query_id, source="test", result_format=ml.ResultFormat.csv
    )
    created = sdk.create_query_task(task)
    # created.result_format is type str, not ResultFormat.csv
    assert ml.ResultFormat.csv.value == created.result_format


# @pytest.mark.usefixtures("test_users")
# def test_it_matches_email_domain_and_returns_sorted(
#     sdk: mtds.Looker40SDK, email_domain: str, users: List[Dict[str, str]]
# ):
#     """search_users_names() should search users matching a given pattern and return
#     sorted results if sort fields are specified.
#     """
#     search_results = sdk.search_users_names(
#         pattern=f"%{email_domain}", sorts="last_name, first_name"
#     )
#     assert len(search_results) == len(users)
#     sorted_test_data: List[Dict[str, str]] = sorted(
#         users, key=itemgetter("last_name", "first_name")
#     )
#     for actual, expected in zip(search_results, sorted_test_data):
#         assert actual.first_name == expected["first_name"]
#         assert actual.last_name == expected["last_name"]


# @pytest.mark.usefixtures("test_users")
# def test_delim_sequence(
#     sdk: mtds.Looker40SDK, email_domain: str, users: List[Dict[str, str]]
# ):
#     search_results = sdk.search_users_names(pattern=f"%{email_domain}")
#     assert len(search_results) == len(users)
#     delim_ids = ml.DelimSequence([cast(int, u.id) for u in search_results])
#     all_users = sdk.all_users(ids=delim_ids)
#     assert len(all_users) == len(users)


def test_it_retrieves_session(sdk: mtds.Looker40SDK):
    """session() should return the current session."""
    current_session = sdk.session()
    assert current_session.workspace_id == "production"


def test_it_updates_session(sdk: mtds.Looker40SDK):
    """update_session() should allow us to change the current workspace."""
    # Switch workspace to dev mode
    sdk.update_session(ml.WriteApiSession(workspace_id="dev"))
    current_session = sdk.session()

    assert isinstance(current_session, ml.ApiSession)
    assert current_session.workspace_id == "dev"

    # Switch workspace back to production
    current_session = sdk.update_session(ml.WriteApiSession(workspace_id="production"))

    assert isinstance(current_session, ml.ApiSession)
    assert current_session.workspace_id == "production"


TQueries = List[Dict[str, Union[str, List[str], Dict[str, str]]]]


def test_it_creates_and_runs_query(
    sdk: mtds.Looker40SDK, queries_system_activity: TQueries
):
    """create_query() creates a query and run_query() returns its result."""
    for q in queries_system_activity:
        limit = cast(str, q["limit"]) or "10"
        request = create_query_request(q, limit)
        query = sdk.create_query(request)
        assert isinstance(query, ml.Query)
        assert query.id
        assert isinstance(query.id, str)
        assert query.id != '0'

        sql = sdk.run_query(query.id, "sql")
        assert "SELECT" in sql

        json_ = sdk.run_query(query.id, "json")
        assert isinstance(json_, str)
        json_ = json.loads(json_)
        assert isinstance(json_, list)
        assert len(json_) == int(limit)
        row = json_[0]
        if q.get("fields"):
            for field in q["fields"]:
                assert field in row.keys()

        csv = sdk.run_query(query.id, "csv")
        assert isinstance(csv, str)
        assert len(re.findall(r"\n", csv)) == int(limit) + 1


def test_it_runs_inline_query(sdk: mtds.Looker40SDK, queries_system_activity: TQueries):
    """run_inline_query() should run a query and return its results."""
    for q in queries_system_activity:
        limit = cast(str, q["limit"]) or "10"
        request = create_query_request(q, limit)

        json_resp = sdk.run_inline_query("json", request)
        assert isinstance(json_resp, str)
        json_: List[Dict[str, Any]] = json.loads(json_resp)
        assert len(json_) == int(limit)

        row = json_[0]
        if q.get("fields"):
            for field in q["fields"]:
                assert field in row.keys()

        csv = sdk.run_inline_query("csv", request)
        assert isinstance(csv, str)
        assert len(re.findall(r"\n", csv)) == int(limit) + 1


# @pytest.mark.usefixtures("remove_test_looks")
# def test_crud_look(sdk: mtds.Looker40SDK, looks):
#     """Test creating, retrieving, updating and deleting a look."""
#     for l in looks:
#         request = create_query_request(l["query"][0], "10")
#         query = sdk.create_query(request)

#         look = sdk.create_look(
#             ml.WriteLookWithQuery(
#                 title=l.get("title"),
#                 description=l.get("description"),
#                 deleted=l.get("deleted"),
#                 is_run_on_load=l.get("is_run_on_load"),
#                 public=l.get("public"),
#                 query_id=query.id,
#                 folder_id=l.get("folder_id") or str(sdk.me().personal_folder_id),
#             )
#         )

#         assert isinstance(look, ml.LookWithQuery)
#         assert look.title == l.get("title")
#         assert look.description == l.get("description")
#         assert look.deleted == l.get("deleted")
#         assert look.is_run_on_load == l.get("is_run_on_load")
#         # TODO this is broken for local dev but works for CI...
#         # assert look.public == l.get("public")
#         assert look.query_id == query.id
#         assert look.folder_id == l.get("folder_id") or sdk.me().home_folder_id
#         assert look.user_id == l.get("user_id") or sdk.me().id

#         # Update
#         assert isinstance(look.id, str)
#         updated_look = sdk.update_look(look.id, ml.WriteLookWithQuery(deleted=True))
#         assert updated_look.deleted
#         assert updated_look.title == look.title

#         look = sdk.update_look(look.id, ml.WriteLookWithQuery(deleted=False))
#         assert not look.deleted


def test_png_svg_downloads(sdk: mtds.Looker40SDK):
    """content_thumbnail() should return a binary or string response based on the specified format."""
    looks = sdk.search_looks(limit=1)
    resource_id: str
    if looks:
        resource_type = "look"
        resource_id = str(looks[0].id)
    else:
        dashboards = sdk.search_dashboards(limit=1)
        if dashboards:
            resource_type = "dashboard"
            resource_id = cast(str, dashboards[0].id)

    png = sdk.content_thumbnail(
        type=resource_type, resource_id=resource_id, format="png"
    )
    assert isinstance(png, bytes)
    try:
        Image.open(io.BytesIO(png))
    except IOError:
        raise AssertionError("png format failed to return an image")

    svg = sdk.content_thumbnail(
        type=resource_type, resource_id=resource_id, format="svg"
    )
    assert isinstance(svg, str)
    assert "<?xml" in svg


def test_setting_default_color_collection(sdk: mtds.Looker40SDK):
    """Given a color collection id, set_default_color_collection() should change the default collection."""
    original = sdk.default_color_collection()
    assert isinstance(original, ml.ColorCollection)
    assert isinstance(original.id, str)
    color_collections = sdk.all_color_collections()
    other: ml.ColorCollection = next(
        filter(lambda c: c.id != original.id, color_collections)
    )
    assert isinstance(other.id, str)
    actual = sdk.set_default_color_collection(other.id)
    assert actual.id == other.id
    updated = sdk.set_default_color_collection(original.id)
    assert updated.id == original.id


def test_search_looks_returns_looks(sdk: mtds.Looker40SDK):
    """search_looks() should return a list of looks."""
    search_results = sdk.search_looks()
    assert isinstance(search_results, list)
    assert len(search_results) > 0
    look = search_results[0]
    assert isinstance(look, ml.Look)
    assert look.title != ""
    assert look.created_at is not None


def test_search_looks_fields_filter(sdk: mtds.Looker40SDK):
    """search_looks() should only return the requested fields passed in the fields
    argument of the request.
    """
    search_results = sdk.search_looks(fields="id, title, description")
    assert isinstance(search_results, list)
    assert len(search_results) > 0
    look = search_results[0]
    assert isinstance(look, ml.Look)
    assert look.title is not None
    assert look.created_at is None


def test_search_looks_title_fields_filter(sdk: mtds.Looker40SDK):
    """search_looks() should be able to filter on title."""
    search_results = sdk.search_looks(title="An SDK%", fields="id, title")
    assert isinstance(search_results, list)
    assert len(search_results) > 0
    look = search_results[0]
    assert isinstance(look.id, str)
    assert look.id != "0"
    assert "SDK" in look.title
    assert look.description is None


def test_search_look_and_run(sdk: mtds.Looker40SDK):
    """run_look() should return CSV and JSON
    CSV will use column descriptions
    JSON will use column names
    JSON_LABEL will use column descriptions
    """
    search_results = sdk.search_looks(title="An SDK Look", fields="id, title")
    assert isinstance(search_results, list)
    assert len(search_results) > 0
    look = search_results[0]
    assert isinstance(look.id, str)
    assert look.id != "0"
    assert "SDK" in look.title
    assert look.description is None
    actual = sdk.run_look(look_id=look.id, result_format="csv")
    assert "Dashboard Count" in actual
    assert "Dashboard ID" in actual
    actual = sdk.run_look(look_id=look.id, result_format="json")
    assert "dashboard.count" in actual
    assert "dashboard.id" in actual
    actual = sdk.run_look(look_id=look.id, result_format="json_label")
    assert "Dashboard Count" in actual
    assert "Dashboard ID" in actual


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
        vis_config=q.get("vis_config"),
        filter_config=q.get("filter_config"),
        visible_ui_sections=q.get("visible_ui_sections"),
        dynamic_fields=q.get("dynamic_fields"),
        client_id=q.get("client_id"),
        query_timezone=q.get("query_timezone"),
    )


# @pytest.mark.usefixtures("remove_test_dashboards")
# def test_crud_dashboard(sdk: mtds.Looker40SDK, queries_system_activity, dashboards):
#     """Test creating, retrieving, updating and deleting a dashboard."""
#     qhash: Dict[Union[str, int], ml.Query] = {}
#     for idx, q in enumerate(queries_system_activity):
#         limit = "10"
#         request = create_query_request(q, limit)
#         key = q.get("id") or str(idx)
#         qhash[key] = sdk.create_query(request)

#     for d in dashboards:
#         dashboard = sdk.create_dashboard(
#             ml.WriteDashboard(
#                 description=d.get("description"),
#                 hidden=d.get("hidden"),
#                 query_timezone=d.get("query_timezone"),
#                 refresh_interval=d.get("refresh_interval"),
#                 title=d.get("title"),
#                 background_color=d.get("background_color"),
#                 load_configuration=d.get("load_configuration"),
#                 lookml_link_id=d.get("lookml_link_id"),
#                 show_filters_bar=d.get("show_filters_bar"),
#                 show_title=d.get("show_title"),
#                 slug=d.get("slug"),
#                 folder_id=d.get("folder_id") or sdk.me().home_folder_id,
#                 text_tile_text_color=d.get("text_tile_text_color"),
#                 tile_background_color=d.get("tile_background_color"),
#                 tile_text_color=d.get("tile_text_color"),
#                 title_color=d.get("title_color"),
#             )
#         )

#         assert isinstance(dashboard, ml.Dashboard)
#         assert isinstance(dashboard.created_at, datetime.datetime)

#         if d.get("background_color"):
#             assert d["background_color"] == dashboard.background_color

#         if d.get("text_tile_text_color"):
#             assert d["text_tile_text_color"] == dashboard.text_tile_text_color

#         if d.get("tile_background_color"):
#             assert d["tile_background_color"] == dashboard.tile_background_color

#         if d.get("tile_text_color"):
#             assert d["tile_text_color"] == dashboard.tile_text_color

#         if d.get("title_color"):
#             assert d["title_color"] == dashboard.title_color

#         # Update dashboard
#         assert isinstance(dashboard.id, str)
#         update_response = sdk.update_dashboard(
#             dashboard.id, ml.WriteDashboard(deleted=True)
#         )
#         assert update_response.deleted
#         assert update_response.title == dashboard.title

#         dashboard = sdk.update_dashboard(dashboard.id, ml.WriteDashboard(deleted=False))
#         assert isinstance(dashboard.id, str)
#         assert not dashboard.deleted

#         if d.get("filters"):
#             for f in d["filters"]:
#                 filter = sdk.create_dashboard_filter(
#                     ml.WriteCreateDashboardFilter(
#                         dashboard_id=dashboard.id,
#                         name=f.get("name"),
#                         title=f.get("title"),
#                         type=f.get("type"),
#                         default_value=f.get("default_value"),
#                         model=f.get("model"),
#                         explore=f.get("explore"),
#                         dimension=f.get("dimension"),
#                         row=f.get("row"),
#                         listens_to_filters=f.get("listens_to_filters"),
#                         allow_multiple_values=f.get("allow_multiple_values"),
#                         required=f.get("required"),
#                     )
#                 )
#                 assert isinstance(filter, ml.DashboardFilter)
#                 assert filter.name == f.get("name")
#                 assert filter.title == f.get("title")
#                 assert filter.type == f.get("type")
#                 assert filter.default_value == f.get("default_value")
#                 assert filter.model == f.get("model")
#                 assert filter.explore == f.get("explore")
#                 assert filter.dimension == f.get("dimension")
#                 assert filter.row == f.get("row")
#                 assert filter.allow_multiple_values == f.get(
#                     "allow_multiple_values", False
#                 )
#                 assert filter.required == f.get("required", False)

#         if d.get("tiles"):
#             for t in d["tiles"]:
#                 tile = sdk.create_dashboard_element(
#                     ml.WriteDashboardElement(
#                         body_text=t.get("body_text"),
#                         dashboard_id=dashboard.id,
#                         look=t.get("look"),
#                         look_id=t.get("look_id"),
#                         merge_result_id=t.get("merge_result_id"),
#                         note_display=t.get("note_display"),
#                         note_state=t.get("note_state"),
#                         note_text=t.get("note_text"),
#                         query=t.get("query"),
#                         query_id=get_query_id(qhash, t.get("query_id")),
#                         refresh_interval=t.get("refresh_interval"),
#                         subtitle_text=t.get("subtitle_text"),
#                         title=t.get("title"),
#                         title_hidden=t.get("title_hidden"),
#                         type=t.get("type"),
#                     )
#                 )

#                 assert isinstance(tile, ml.DashboardElement)
#                 assert tile.dashboard_id == dashboard.id
#                 assert tile.title == t.get("title")
#                 assert tile.type == t.get("type")


# def get_query_id(
#     qhash: Dict[Union[str, int], ml.Query], id: Union[str, int]
# ) -> Optional[int]:
#     if isinstance(id, str) and id.startswith("#"):
#         id = id[1:]
#         # if id is invalid, default to first query. test data is bad
#         query = qhash.get(id) or list(qhash.values())[0]
#         query_id = query.id
#     elif (isinstance(id, str) and id.isdigit()) or isinstance(id, int):
#         query_id = int(id)
#     else:
#         query_id = None
#     return query_id
