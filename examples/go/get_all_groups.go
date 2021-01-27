package main

import (
	"fmt"

	"github.com/looker-open-source/sdk-codegen/go/rtl"
	"github.com/looker-open-source/sdk-codegen/go/sdk/v4"
)

func main() {
	// Read settings from ini file
	cfg, err := rtl.NewSettingsFromFile("looker.ini", nil)
	if err != nil {
		panic(err)
	}

	// New instance of LookerSDK
	sdk := v4.NewLookerSDK(rtl.NewAuthSession(cfg))

	// List all Groups in Looker
	looks, err := sdk.AllGroups(v4.RequestAllGroups{}, nil)
	if err != nil {
		panic(err)
	}

	println("-------------------------")
	// Iterate the Groups and print basic info
	for _, g := range looks {
		fmt.Printf("Group: %s\tUser Count: %d \n", *g.Name, *g.UserCount)
	}
	println("-------------------------")
}
