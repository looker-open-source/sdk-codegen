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

	// List all Folders in Looker
	folders, err := sdk.SearchFolders(v4.RequestSearchFolders{}, nil)
	if err != nil {
		panic(err)
	}

	println("-------------------------")
	// Iterate the Folders and print basic info
	for _, f := range folders {
		fmt.Printf("Folders ID: %s with Name: %s \n", *f.Id, f.Name)
	}
	println("-------------------------")
}
