import datetime
import io
import json
import re
from operator import itemgetter
import time
from typing import Any, cast, Dict, List, Optional, Union, Sequence
import warnings

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
    
@pytest.mark.usefixtures("remove_test_looks")
def test_crud_look(sdk: mtds.Looker40SDK, looks):
    """Test creating, retrieving, updating and deleting a look."""
    for l in looks:
        request = create_query_request(l["query"][0], "10")
        query = sdk.create_query(request)

        look = sdk.create_look(
            ml.WriteLookWithQuery(
                title=l.get("title"),
                description=l.get("description"),
                deleted=l.get("deleted"),
                is_run_on_load=l.get("is_run_on_load"),
                public=l.get("public"),
                query_id=query.id,
                folder_id=l.get("folder_id") or str(sdk.me().personal_folder_id),
            )
        )

        assert isinstance(look, ml.LookWithQuery)
        assert look.title == l.get("title")
        assert look.description == l.get("description")
        assert look.deleted == l.get("deleted")
        assert look.is_run_on_load == l.get("is_run_on_load")
        # TODO this is broken for local dev but works for CI...
        # assert look.public == l.get("public")
        assert look.query_id == query.id
        assert look.folder_id == l.get("folder_id") or sdk.me().home_folder_id
        assert look.user_id == l.get("user_id") or sdk.me().id

        # Update
        assert isinstance(look.id, str)
        updated_look = sdk.update_look(look.id, ml.WriteLookWithQuery(deleted=True))
        assert updated_look.deleted
        assert updated_look.title == look.title

        look = sdk.update_look(look.id, ml.WriteLookWithQuery(deleted=False))
        assert not look.deleted
    
@pytest.mark.usefixtures("remove_test_dashboards")
def test_crud_dashboard(sdk: mtds.Looker40SDK, queries_system_activity, dashboards):
    """Test creating, retrieving, updating and deleting a dashboard."""
    qhash: Dict[Union[str, int], ml.Query] = {}
    for idx, q in enumerate(queries_system_activity):
        limit = "10"
        request = create_query_request(q, limit)
        key = q.get("id") or str(idx)
        qhash[key] = sdk.create_query(request)

    for d in dashboards:
        dashboard = sdk.create_dashboard(
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
                folder_id=d.get("folder_id") or sdk.me().home_folder_id,
                text_tile_text_color=d.get("text_tile_text_color"),
                tile_background_color=d.get("tile_background_color"),
                tile_text_color=d.get("tile_text_color"),
                title_color=d.get("title_color"),
            )
        )

        assert isinstance(dashboard, ml.Dashboard)
        assert isinstance(dashboard.created_at, datetime.datetime)

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
        update_response = sdk.update_dashboard(
            dashboard.id, ml.WriteDashboard(deleted=True)
        )
        assert update_response.deleted
        assert update_response.title == dashboard.title

        dashboard = sdk.update_dashboard(dashboard.id, ml.WriteDashboard(deleted=False))
        assert isinstance(dashboard.id, str)
        assert not dashboard.deleted

        if d.get("filters"):
            for f in d["filters"]:
                filter = sdk.create_dashboard_filter(
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
                tile = sdk.create_dashboard_element(
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