package integration

import (
	// "encoding/json"
	// "io/ioutil"
	// "path/filepath"
	"testing"
	// "strings"
	// "fmt"

	"github.com/looker-open-source/sdk-codegen/go/rtl"
	v4 "github.com/looker-open-source/sdk-codegen/go/sdk/v4"
)

// type testDataStruct struct {
// 	QueriesSystemActivity []v4.WriteQuery `json:"queries_system_activity"`
// }

// func getTestData(testData *testDataStruct) error {
// 	absPath, err := filepath.Abs("../../test/data.yml.json")

// 	if err != nil {
// 		return err
// 	}

// 	fileContent, err := ioutil.ReadFile(absPath)

// 	if err != nil {
// 		return err
// 	}

// 	return json.Unmarshal(fileContent, &testData)
// }

func TestIntegrationGoSDK(t *testing.T) {
	// var testData testDataStruct
	// err := getTestData(&testData)

	// if err != nil {
	// 	t.Errorf("Error reading/parsing test data to set up integration tests, error = %v", err)
	// }

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
			FirstName: &firstName,
			LastName: &lastName,
			IsDisabled: &isDisabled,
			Locale: &locale,
		}, "", nil)

		if err != nil {
			t.Errorf("CreateUser() failed. error=%v", err)
		}
		if *user.FirstName != firstName {
			t.Errorf("Create user FirstName not the same. got=%v want=%v", *user.FirstName, firstName )
		}
		if *user.LastName != lastName {
			t.Errorf("Create user LastName not the same. got=%v want=%v", *user.LastName, lastName )
		}
		if *user.IsDisabled != isDisabled {
			t.Errorf("Create user IsDisabled not the same. got=%v want=%v", *user.IsDisabled, isDisabled )
		}
		if *user.Locale != locale {
			t.Errorf("Create user Locale not the same. got=%v want=%v", *user.Locale, locale )
		}

		id := user.Id

		user, err = sdk.User(*id, "", nil)

		if err != nil {
			t.Errorf("User() failed. error=%v", err)
		}
		if *user.FirstName != firstName {
			t.Errorf("Get user FirstName not the same. got=%v want=%v", *user.FirstName, firstName )
		}
		if *user.LastName != lastName {
			t.Errorf("Get user LastName not the same. got=%v want=%v", *user.LastName, lastName )
		}
		if *user.IsDisabled != isDisabled {
			t.Errorf("Get user IsDisabled not the same. got=%v want=%v", *user.IsDisabled, isDisabled )
		}
		if *user.Locale != locale {
			t.Errorf("Get user Locale not the same. got=%v want=%v", *user.Locale, locale )
		}

		newFirstName := "Jane"
		newLocale := "uk"
		newIsDisabled := true

		user, err = sdk.UpdateUser(*id, v4.WriteUser{
			FirstName: &newFirstName,
			LastName: &lastName,
			IsDisabled: &newIsDisabled,
			Locale: &newLocale,
		}, "", nil)

		if err != nil {
			t.Errorf("UpdateUser() failed. error=%v", err)
		}
		if *user.FirstName != newFirstName {
			t.Errorf("Update user FirstName not the same. got=%v want=%v", *user.FirstName, newFirstName )
		}
		if *user.LastName != lastName {
			t.Errorf("Update user LastName not the same. got=%v want=%v", *user.LastName, lastName )
		}
		if *user.IsDisabled != newIsDisabled {
			t.Errorf("Update user IsDisabled not the same. got=%v want=%v", *user.IsDisabled, newIsDisabled )
		}
		if *user.Locale != newLocale {
			t.Errorf("Update user Locale not the same. got=%v want=%v", *user.Locale, newLocale )
		}

		resp, err := sdk.DeleteUser(*id, nil)

		if err != nil {
			t.Errorf("DeleteUser() failed. error=%v", err)
		}

		if resp != "" {
			t.Errorf("Delete user returned non empty response. got=%v", resp)
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

	// t.Run("Create Run Query", func(t *testing.T) {
	// 	query, err := sdk.CreateQuery(testData.QueriesSystemActivity[0], "", nil)

	// 	if err != nil {
	// 		t.Errorf("CreateQuery() failed. error=%v", err)
	// 	}

	// 	sql, err := sdk.RunQuery(v4.RequestRunQuery{
	// 		QueryId: *query.Id,
	// 		ResultFormat: "sql",
	// 	}, nil)

	// 	if err != nil {
	// 		t.Errorf("RunQuery() failed. error=%v", err)
	// 	}

	// 	if !strings.Contains(sql, "SELECT") {
	// 		t.Errorf("RunQuery() with 'sql' ResultFormat did not return string with 'SELECT'. got=%v", sql)
	// 	}

	// 	jsonString, err := sdk.RunQuery(v4.RequestRunQuery{
	// 		QueryId: *query.Id,
	// 		ResultFormat: "json",
	// 	}, nil)

	// 	if err != nil {
	// 		t.Errorf("RunQuery() failed. error=%v", err)
	// 	}

	// 	fmt.Printf("jsonString %v \n", jsonString)

	// 	// for q in queries_system_activity:
    //     // limit = cast(str, q["limit"]) or "10"
    //     // request = create_query_request(q, limit)
    //     // query = sdk.create_query(request)
    //     // assert isinstance(query, ml.Query)
    //     // assert query.id
    //     // assert isinstance(query.id, int)
    //     // assert query.id > 0

    //     // sql = sdk.run_query(query.id, "sql")
    //     // assert "SELECT" in sql

    //     // json_ = sdk.run_query(query.id, "json")
    //     // assert isinstance(json_, str)
    //     // json_ = json.loads(json_)
    //     // assert isinstance(json_, list)
    //     // assert len(json_) == int(limit)
    //     // row = json_[0]
    //     // if q.get("fields"):
    //     //     for field in q["fields"]:
    //     //         assert field in row.keys()

    //     // csv = sdk.run_query(query.id, "csv")
    //     // assert isinstance(csv, str)
    //     // assert len(re.findall(r"\n", csv)) == int(limit) + 1
	// })
}

