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

	// List all Looks in Looker
	looks, err := sdk.SearchLooks(v4.RequestSearchLooks{}, nil)
	if err != nil {
		panic(err)
	}

	println("-------------------------")
	// Iterate the Looks and print basic info
	for _, l := range looks {
		fmt.Printf("Look: %s\tID: %d \tWas Deleted? %t \n", *l.Title, *l.Id, *l.Deleted)
	}
	println("-------------------------")
}
