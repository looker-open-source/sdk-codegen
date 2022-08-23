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