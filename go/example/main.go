package main

import (
	"fmt"
	"os"

	"github.com/looker-open-source/sdk-codegen/go/rtl"
	v4 "github.com/looker-open-source/sdk-codegen/go/sdk/v4"
)

func check(err error) {
	if err != nil {
		panic(err)
	}
}

func printAllUsers(sdk *v4.LookerSDK) {
	// List all users in Looker
	users, err := sdk.AllUsers(v4.RequestAllUsers{}, nil)
	check(err)

	println("-------------------------")
	// Iterate the users and print basic user info
	for _, u := range users {
		fmt.Printf("user: %s:%s:%s\n", *u.FirstName, *u.LastName, *u.Email)
	}
	println("-------------------------")
}

func printAllProjects(sdk *v4.LookerSDK) {
	projects, err := sdk.AllProjects("", nil)
	check(err)
	for _, proj := range projects {
		fmt.Printf("Project: %s %s %s\n", *proj.Name, *proj.Id, *proj.GitRemoteUrl)
	}
}

func printAboutMe(sdk *v4.LookerSDK) {

	me, err := sdk.Me("", nil)
	check(err)

	fmt.Printf("You are %s\n", *(me.Email))

	// Search for this user by their e-mail
	users, err := sdk.SearchUsers(v4.RequestSearchUsers{Email: me.Email}, nil)
	if err != nil {
		fmt.Printf("Error getting myself %v\n", err)
	}
	if len(users) != 1 {
		fmt.Printf("Found %d users with my email expected 1\n", len(users))
	}
}

func main() {
	// Default config file location
	lookerIniPath := "../../looker.ini"
	if len(os.Args) > 1 {
		// If first argument exists then it is the config file
		lookerIniPath = os.Args[1]
	}

	// Read settings from ini file
	cfg, err := rtl.NewSettingsFromFile(lookerIniPath, nil)
	check(err)

	// New instance of LookerSDK
	sdk := v4.NewLookerSDK(rtl.NewAuthSession(cfg))

	printAllProjects(sdk)

	printAllUsers(sdk)

	printAboutMe(sdk)

}
