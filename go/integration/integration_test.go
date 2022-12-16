package integration

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"path/filepath"
	"strings"
	"testing"

	json "github.com/json-iterator/go"
	extra "github.com/json-iterator/go/extra"
	"github.com/looker-open-source/sdk-codegen/go/rtl"
	v4 "github.com/looker-open-source/sdk-codegen/go/sdk/v4"
)

type testDataStruct struct {
	QueriesSystemActivity []v4.WriteQuery       `json:"queries_system_activity"`
	Looks                 []testLookStruct      `json:"looks"`
	Dashboards            []testDashboardStruct `json:"dashabords"`
}

type testLookStruct struct {
	Title       string          `json:"title,omitempty"`
	Deleted     bool            `json:"deleted,omitempty"`
	Description string          `json:"description,omitempty"`
	IsRunOnLoad bool            `json:"is_run_on_load,omitempty"`
	Public      bool            `json:"public,omitempty"`
	FolderId    string          `json:"folder_id,omitempty"`
	Query       []v4.WriteQuery `json:"query,omitempty"`
}

type testDashboardStruct struct {
	Title           string                     `json:"title,omitempty"`
	BackgroundColor string                     `json:"background_color,omitempty`
	Filters         []v4.CreateDashboardFilter `json:"filters,omitempty"`
	Tiles           []testTilesStruct          `json:"tiles,omitempty"`
}

type testTilesStruct struct {
	BodyText     *string `json:"body_text,omitempty"`     // Text tile body text
	SubtitleText *string `json:"subtitle_text,omitempty"` // Text tile subtitle text
	Title        *string `json:"title,omitempty"`         // Title of dashboard element
	TitleText    *string `json:"title_text,omitempty"`    // Text tile title
	Type         *string `json:"type,omitempty"`          // Type
}

func getTestData(testData *testDataStruct) error {
	absPath, err := filepath.Abs("../../test/data.yml.json")

	if err != nil {
		return err
	}

	fileContent, err := ioutil.ReadFile(absPath)

	if err != nil {
		return err
	}

	extra.RegisterFuzzyDecoders()
	return json.Unmarshal(fileContent, &testData)
}

func TestIntegrationGoSDK(t *testing.T) {
	var testData testDataStruct
	err := getTestData(&testData)

	if err != nil {
		t.Errorf("Error reading/parsing test data to set up integration tests, error = %v", err)
	}

	cfg, err := rtl.NewSettingsFromEnv()

	if err != nil {
		t.Errorf("TestCRUDuser() error getting settings from env, error = %v", err)
	}

	sdk := v4.NewLookerSDK(rtl.NewAuthSession(cfg))

	t.Run("CRUD User", func(t *testing.T) {
		firstName := "John"
		lastName := "Doe"
		isDisabled := false
		locale := "fr"

		user, err := sdk.CreateUser(v4.WriteUser{
			FirstName:  &firstName,
			LastName:   &lastName,
			IsDisabled: &isDisabled,
			Locale:     &locale,
		}, "", nil)

		if err != nil {
			t.Errorf("CreateUser() failed. error=%v", err)
		}
		if *user.FirstName != firstName {
			t.Errorf("Create user FirstName not the same. got=%v want=%v", *user.FirstName, firstName)
		}
		if *user.LastName != lastName {
			t.Errorf("Create user LastName not the same. got=%v want=%v", *user.LastName, lastName)
		}
		if *user.IsDisabled != isDisabled {
			t.Errorf("Create user IsDisabled not the same. got=%v want=%v", *user.IsDisabled, isDisabled)
		}
		if *user.Locale != locale {
			t.Errorf("Create user Locale not the same. got=%v want=%v", *user.Locale, locale)
		}

		id := user.Id

		user, err = sdk.User(*id, "", nil)

		if err != nil {
			t.Errorf("User() failed. error=%v", err)
		}
		if *user.FirstName != firstName {
			t.Errorf("Get user FirstName not the same. got=%v want=%v", *user.FirstName, firstName)
		}
		if *user.LastName != lastName {
			t.Errorf("Get user LastName not the same. got=%v want=%v", *user.LastName, lastName)
		}
		if *user.IsDisabled != isDisabled {
			t.Errorf("Get user IsDisabled not the same. got=%v want=%v", *user.IsDisabled, isDisabled)
		}
		if *user.Locale != locale {
			t.Errorf("Get user Locale not the same. got=%v want=%v", *user.Locale, locale)
		}

		newFirstName := "Jane"
		newLocale := "uk"
		newIsDisabled := true

		user, err = sdk.UpdateUser(*id, v4.WriteUser{
			FirstName:  &newFirstName,
			LastName:   &lastName,
			IsDisabled: &newIsDisabled,
			Locale:     &newLocale,
		}, "", nil)

		if err != nil {
			t.Errorf("UpdateUser() failed. error=%v", err)
		}
		if *user.FirstName != newFirstName {
			t.Errorf("Update user FirstName not the same. got=%v want=%v", *user.FirstName, newFirstName)
		}
		if *user.LastName != lastName {
			t.Errorf("Update user LastName not the same. got=%v want=%v", *user.LastName, lastName)
		}
		if *user.IsDisabled != newIsDisabled {
			t.Errorf("Update user IsDisabled not the same. got=%v want=%v", *user.IsDisabled, newIsDisabled)
		}
		if *user.Locale != newLocale {
			t.Errorf("Update user Locale not the same. got=%v want=%v", *user.Locale, newLocale)
		}

		resp, err := sdk.DeleteUser(*id, nil)

		if err != nil {
			t.Errorf("DeleteUser() failed. error=%v", err)
		}

		if resp != "" {
			t.Errorf("Delete user returned non empty response. got=%v", resp)
		}
	})

	t.Run("CRUD User Attribute Group Value", func(t *testing.T) {
		name := "foo"
		group, err := sdk.CreateGroup(v4.WriteGroup{
			Name: &name,
		}, "", nil)
		if err != nil {
			t.Errorf("CreateGroup() failed. error=%v", err)
		}

		groupId := group.Id
		group, err = sdk.Group(*groupId, "", nil)
		if err != nil {
			t.Errorf("Group() failed. error=%v", err)
		}

		attributeName := "bar"
		attributeLabel := "bar"
		attributeType := "string"
		ua, err := sdk.CreateUserAttribute(v4.WriteUserAttribute{
			Name:  attributeName,
			Label: attributeLabel,
			Type:  attributeType,
		}, "", nil)
		if err != nil {
			t.Errorf("CreateUserAttribute failed. error=%v", err)
		}

		uaId := ua.Id
		ua, err = sdk.UserAttribute(*uaId, "", nil)
		if err != nil {
			t.Errorf("UserAttribute() failed. error=%v", err)
		}

		value := "baz"
		_, err = sdk.UpdateUserAttributeGroupValue(*groupId, *uaId, v4.UserAttributeGroupValue{
			GroupId:         groupId,
			UserAttributeId: uaId,
			Value:           &value,
		}, nil)
		if err != nil {
			t.Errorf("UpdateUserAttributeGroupValue() failed. error=%v", err)
		}

		err = sdk.DeleteUserAttributeGroupValue(*groupId, *uaId, nil)
		if err != nil {
			t.Errorf("DeleteUserAttributeGroupValue() failed. error=%v", err)
		}

		_, err = sdk.DeleteUserAttribute(*uaId, nil)
		if err != nil {
			t.Errorf("DeleteUserAttribute() failed. error=%v", err)
		}

		_, err = sdk.DeleteGroup(*groupId, nil)
		if err != nil {
			t.Errorf("DeleteGroup() failed. error=%v", err)
		}

	})

	t.Run("Me()", func(t *testing.T) {
		user, err := sdk.Me("", nil)

		if err != nil {
			t.Errorf("Me() failed. error=%v", err)
		}

		creds := *user.CredentialsApi3

		if len(creds) == 0 {
			t.Errorf("Me() returns user with no api credentials")
		}

		user, err = sdk.Me("id", nil)

		if err != nil {
			t.Errorf("Me() with filter fields set failed. error=%v", err)
		}

		if user.CredentialsApi3 != nil {
			t.Errorf("Me() returned creds when they should have been filtered")
		}
	})

	t.Run("Get and Update Session", func(t *testing.T) {
		session, err := sdk.Session(nil)

		if err != nil {
			t.Errorf("Session() failed. error=%v", err)
		}

		if *session.WorkspaceId != "production" {
			t.Errorf("Session() does not return 'production' workspace id, got=%v", *session.WorkspaceId)
		}

		newWorkSpaceId := "dev"

		_, err = sdk.UpdateSession(v4.WriteApiSession{
			WorkspaceId: &newWorkSpaceId,
		}, nil)

		if err != nil {
			t.Errorf("UpdateSession() failed. error=%v", err)
		}

		session, err = sdk.Session(nil)

		if err != nil {
			t.Errorf("Session() failed. error=%v", err)
		}

		if *session.WorkspaceId != newWorkSpaceId {
			t.Errorf("Session() does not return 'dev' workspace id after UpdateSession(), got=%v", *session.WorkspaceId)
		}

		oldWorkSpaceId := "production"

		_, err = sdk.UpdateSession(v4.WriteApiSession{
			WorkspaceId: &oldWorkSpaceId,
		}, nil)

		if err != nil {
			t.Errorf("UpdateSession() failed. error=%v", err)
		}

		session, err = sdk.Session(nil)

		if err != nil {
			t.Errorf("Session() failed. error=%v", err)
		}

		if *session.WorkspaceId != oldWorkSpaceId {
			t.Errorf("Session() does not return 'production' workspace id after UpdateSession(), got=%v", *session.WorkspaceId)
		}
	})

	t.Run("Create and Run Query", func(t *testing.T) {
		for _, q := range testData.QueriesSystemActivity {
			query, err := sdk.CreateQuery(q, "", nil)

			if err != nil {
				t.Errorf("CreateQuery() failed. error=%v", err)
			}

			sql, err := sdk.RunQuery(v4.RequestRunQuery{
				QueryId:      *query.Id,
				ResultFormat: "sql",
			}, nil)

			if err != nil {
				t.Errorf("RunQuery() with sql result format failed. error=%v", err)
			}

			if !strings.Contains(sql, "SELECT") {
				t.Errorf("RunQuery() with 'sql' ResultFormat did not return string with 'SELECT'. got=%v", sql)
			}

			jsonString, err := sdk.RunQuery(v4.RequestRunQuery{
				QueryId:      *query.Id,
				ResultFormat: "json",
			}, nil)

			if err != nil {
				t.Errorf("RunQuery() with json result format failed. error=%v", err)
			}

			var result []map[string]interface{}
			json.Unmarshal([]byte(jsonString), &result)

			row := result[0]
			for _, f := range *q.Fields {
				if _, ok := row[f]; !ok {
					t.Errorf("RunQuery() with json result missing field=%v error=%v", f, err)
				}
			}

			_, err = sdk.RunQuery(v4.RequestRunQuery{
				QueryId:      *query.Id,
				ResultFormat: "csv",
			}, nil)

			if err != nil {
				t.Errorf("RunQuery() with csv result format failed. error=%v", err)
			}
		}
	})

	t.Run("Create and Run Inline Query", func(t *testing.T) {
		for _, q := range testData.QueriesSystemActivity {
			jsonString, err := sdk.RunInlineQuery(v4.RequestRunInlineQuery{
				Body:         q,
				ResultFormat: "json",
			}, nil)

			if err != nil {
				t.Errorf("RunInlineQuery() with json result format failed. error=%v", err)
			}

			var result []map[string]interface{}
			json.Unmarshal([]byte(jsonString), &result)

			row := result[0]
			for _, f := range *q.Fields {
				if _, ok := row[f]; !ok {
					t.Errorf("RunInlineQuery() with json result missing field=%v error=%v", f, err)
				}
			}
		}
	})

	t.Run("CRUD Look", func(t *testing.T) {
		me, _ := sdk.Me("", nil)
		folderId := fmt.Sprint(*me.PersonalFolderId)
		for _, testLook := range testData.Looks {
			query, err := sdk.CreateQuery(testLook.Query[0], "", nil)

			if err != nil {
				t.Errorf("CreateQuery() failed. error=%v", err)
			}

			// Create
			look, err := sdk.CreateLook(v4.WriteLookWithQuery{
				Title:       &testLook.Title,
				Description: &testLook.Description,
				Deleted:     &testLook.Deleted,
				IsRunOnLoad: &testLook.IsRunOnLoad,
				Public:      &testLook.Public,
				QueryId:     query.Id,
				FolderId:    &folderId,
			}, "", nil)

			if err != nil {
				t.Errorf("CreateLook() failed. error=%v", err)
			}

			if *look.Title != testLook.Title {
				t.Errorf("CreateLook() Title doesn't match. got=%v want=%v", *look.Title, testLook.Title)
			}

			if *look.Description != testLook.Description {
				t.Errorf("CreateLook() Description doesn't match. got=%v want=%v", *look.Description, testLook.Description)
			}

			if *look.Deleted != testLook.Deleted {
				t.Errorf("CreateLook() Deleted doesn't match. got=%v want=%v", *look.Deleted, testLook.Deleted)
			}

			if *look.IsRunOnLoad != testLook.IsRunOnLoad {
				t.Errorf("CreateLook() IsRunOnLoad doesn't match. got=%v want=%v", *look.IsRunOnLoad, testLook.IsRunOnLoad)
			}

			// Get
			getLook, err := sdk.Look(*look.Id, "", nil)

			if err != nil {
				t.Errorf("Look() failed. error=%v", err)
			}

			if *getLook.Title != *look.Title {
				t.Errorf("Look() Title doesn't match. got=%v want=%v", *getLook.Title, *look.Title)
			}

			newDescription := "a new description"

			// Update
			updatedLook, err := sdk.UpdateLook(*look.Id, v4.WriteLookWithQuery{
				Description: &newDescription,
			}, "", nil)

			if err != nil {
				t.Errorf("UpdateLook() failed. error=%v", err)
			}

			if *updatedLook.Title != *look.Title {
				t.Errorf("UpdateLook() Title doesn't match. got=%v want=%v", *updatedLook.Title, *look.Title)
			}

			if *updatedLook.Description != newDescription {
				t.Errorf("UpdateLook() Description doesn't match. Did not update. got=%v want=%v", *updatedLook.Description, newDescription)
			}

			// Delete
			s, err := sdk.DeleteLook(*updatedLook.Id, nil)

			if err != nil {
				t.Errorf("DeleteLook() failed. error=%v", err)
			}

			if s != "" {
				t.Errorf("DeleteLook() return string not empty. got=%s", s)
			}

			getLook, err = sdk.Look(*look.Id, "", nil)

			if err == nil {
				t.Errorf("Look() should have failed after delete. Expected error, got nil error")
			}
		}
	})
	t.Run("CRUD Dashboard, Filter, Element", func(t *testing.T) {
		me, _ := sdk.Me("", nil)
		folderId := fmt.Sprint(*me.PersonalFolderId)

		for _, testDashboard := range testData.Dashboards {
			// Create
			dashboard, err := sdk.CreateDashboard(v4.WriteDashboard{
				Title:           &testDashboard.Title,
				BackgroundColor: &testDashboard.BackgroundColor,
				FolderId:        &folderId,
			}, nil)

			if err != nil {
				t.Errorf("CreateDashboard() failed. error=%v", err)
			}

			if *dashboard.Title != testDashboard.Title {
				t.Errorf("CreateDashboard() Title doesn't match. got=%v want=%v", *dashboard.Title, testDashboard.Title)
			}

			if *dashboard.BackgroundColor != testDashboard.BackgroundColor {
				t.Errorf("CreateDashboard() Description doesn't match. got=%v want=%v", *dashboard.Description, testDashboard.BackgroundColor)
			}

			// Get
			getDashboard, err := sdk.Dashboard(*dashboard.Id, "", nil)

			if err != nil {
				t.Errorf("Dashboard() failed. error=%v", err)
			}

			if *getDashboard.Title != *dashboard.Title {
				t.Errorf("Dashboard() Title doesn't match. got=%v want=%v", *getDashboard.Title, *dashboard.Title)
			}

			// Update
			newColor := "red"
			updatedDashboard, err := sdk.UpdateDashboard(*dashboard.Id, v4.WriteDashboard{
				BackgroundColor: &newColor,
			}, nil)

			if err != nil {
				t.Errorf("UpdateDashboard() failed. error=%v", err)
			}

			if *updatedDashboard.Title != *dashboard.Title {
				t.Errorf("UpdateDashboard() Title doesn't match. got=%v want=%v", *updatedDashboard.Title, *dashboard.Title)
			}

			if *updatedDashboard.BackgroundColor != newColor {
				t.Errorf("UpdateDashboard() BackgroundColor doesn't match. Did not update. got=%v want=%v", *updatedDashboard.Description, newColor)
			}

			// Filter
			for _, testFilter := range testDashboard.Filters {
				filter, err := sdk.CreateDashboardFilter(v4.WriteCreateDashboardFilter{
					DashboardId:         *dashboard.Id,
					Name:                testFilter.Name,
					Title:               testFilter.Title,
					Type:                testFilter.Type,
					DefaultValue:        testFilter.DefaultValue,
					Model:               testFilter.Model,
					Explore:             testFilter.Explore,
					Dimension:           testFilter.Dimension,
					Row:                 testFilter.Row,
					AllowMultipleValues: testFilter.AllowMultipleValues,
				}, "", nil)

				if err != nil {
					t.Errorf("CreateDashboardFilter() failed. error=%v", err)
				}

				if *filter.Name != testFilter.Name {
					t.Errorf("CreateDashboardFilter() Name doesn't match. got=%v want=%v", *filter.Name, testFilter.Name)
				}

				if *filter.Title != testFilter.Title {
					t.Errorf("CreateDashboardFilter() Title doesn't match. got=%v want=%v", *filter.Title, testFilter.Title)
				}

				if *filter.Type != testFilter.Type {
					t.Errorf("CreateDashboardFilter() Type doesn't match. got=%v want=%v", *filter.Type, testFilter.Type)
				}

				if *filter.Dimension != *testFilter.Dimension {
					t.Errorf("CreateDashboardFilter() Dimension doesn't match. got=%v want=%v", *filter.Dimension, *testFilter.Dimension)
				}
			}

			// Elements

			query, err := sdk.CreateQuery(testData.QueriesSystemActivity[0], "", nil)

			if err != nil {
				t.Errorf("CreateQuery() failed. error=%v", err)
			}

			for _, testTile := range testDashboard.Tiles {
				tile, err := sdk.CreateDashboardElement(v4.RequestCreateDashboardElement{
					Body: v4.WriteDashboardElement{
						BodyText:     testTile.BodyText,
						Type:         testTile.Type,
						TitleText:    testTile.TitleText,
						Title:        testTile.Title,
						SubtitleText: testTile.SubtitleText,
						QueryId:      query.Id,
					},
				}, nil)

				if err != nil {
					t.Errorf("CreateDashboardElement() failed. error=%v", err)
				}

				if *tile.Title != *testTile.Title {
					t.Errorf("CreateDashboardElement() Title doesn't match. got=%v want=%v", *tile.Title, *testTile.Title)
				}

				if *tile.BodyText != *testTile.BodyText {
					t.Errorf("CreateDashboardElement() BodyText doesn't match. got=%v want=%v", *tile.BodyText, *testTile.BodyText)
				}

				if *tile.Type != *testTile.Type {
					t.Errorf("CreateDashboardElement() Type doesn't match. got=%v want=%v", *tile.Type, *testTile.Type)
				}
			}

			// Delete
			s, err := sdk.DeleteDashboard(*dashboard.Id, nil)

			if err != nil {
				t.Errorf("DeleteDashboard() failed. error=%v", err)
			}

			if s != "" {
				t.Errorf("DeleteDashboard() return string not empty. got=%s", s)
			}

			getDashboard, err = sdk.Dashboard(*dashboard.Id, "", nil)

			if err == nil {
				t.Errorf("Dashboard() should have failed after delete. Expected error, got nil error")
			}
		}
	})

	t.Run("Download PNG and SVG", func(t *testing.T) {
		var searchLimit int64 = 1
		looks, err := sdk.SearchLooks(v4.RequestSearchLooks{
			Limit: &searchLimit,
		}, nil)

		if err != nil {
			t.Errorf("SearchLooks() failed. error=%v", err)
		}

		var id string
		var contentType string

		if len(looks) > 0 {
			id = *looks[0].Id
			contentType = "look"
		} else {
			dashboards, err := sdk.SearchDashboards(v4.RequestSearchDashboards{
				Limit: &searchLimit,
			}, nil)

			if err != nil {
				t.Errorf("SearchDashboards() failed. error=%v", err)
			}

			if len(dashboards) > 0 {
				id = *dashboards[0].Id
				contentType = "dashboard"
			} else {
				t.Errorf("No Dashboard or Look available to test PNG and SVG download")
			}
		}

		format := "png"

		image, err := sdk.ContentThumbnail(v4.RequestContentThumbnail{
			ResourceId: id,
			Type:       contentType,
			Format:     &format,
		}, nil)

		if err != nil {
			t.Errorf("ContentThumbnail() with png format failed. error=%v", err)
		}

		mimeType := http.DetectContentType([]byte(image))
		if mimeType != "image/png" {
			t.Errorf("ContentThumbnail() result is not image/png mime type, got mime type: %v", mimeType)
		}

		format = "svg"

		image, err = sdk.ContentThumbnail(v4.RequestContentThumbnail{
			ResourceId: id,
			Type:       contentType,
			Format:     &format,
		}, nil)

		if err != nil {
			t.Errorf("ContentThumbnail() with svg format failed. error=%v", err)
		}

		mimeType = http.DetectContentType([]byte(image))
		if !strings.HasPrefix(mimeType, "text/xml") {
			t.Errorf("ContentThumbnail() result is not image/svg mime type, got mime type: %v", mimeType)
		}
	})
}
