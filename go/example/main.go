package main

import (
	"fmt"
	"github.com/looker-open-source/sdk-codegen/go/rtl"
	v4 "github.com/looker-open-source/sdk-codegen/go/sdk/v4"
)

func main() {
	// Read settings from ini file
	cfg, err := rtl.NewSettingsFromFile("../../looker.ini", nil)
	if err != nil {
		panic(err)
	}

	// New instance of LookerSDK
	sdk := v4.NewLookerSDK(rtl.NewAuthSession(cfg))

	// List all users in Looker
	users, err := sdk.AllUsers(v4.RequestAllUsers{}, nil)
	if err != nil {
		panic(err)
	}

	println("-------------------------")
	// Iterate the users and print basic user info
	for _, u := range users {
		fmt.Printf("user: %s:%s:%s\n", *u.FirstName, *u.LastName, *u.Email)
	}
	println("-------------------------")

}
