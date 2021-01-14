package main

import (
	"fmt"

	"github.com/looker-open-source/sdk-codegen/go/rtl"
	v4 "github.com/looker-open-source/sdk-codegen/go/sdk/v4"
)

func main() {
	// Read settings from ini file
	cfg, err := rtl.NewSettingsFromFile("looker.ini", nil)
	if err != nil {
		panic(err)
	}

	// New instance of LookerSDK
	sdk := v4.NewLookerSDK(rtl.NewAuthSession(cfg))

	// List all Dashboards in Looker
	dashboards, err := sdk.SearchDashboards(v4.RequestSearchDashboards{}, nil)
	if err != nil {
		panic(err)
	}

	println("-------------------------")
	// Iterate the Dashboards and print basic info
	for _, d := range dashboards {
		fmt.Printf("Dashboard: %s\tID: %s \n", *d.Title, *d.Id)
	}
	println("-------------------------")
}
