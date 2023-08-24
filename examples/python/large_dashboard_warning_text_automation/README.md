# Large Dashboard Warning Automation

## Overview

This repository contains an example script which shows how to add a warning text tile to all dashboards with more than 25 queries (adjustable). 

The script works by running a System Activity query to grab a list of all dashboards with more than 25 tiles. It then updates each dashboard and adds a warning text tile to the top of the dashboards.

Screenshot of what the warning text tile looks like:

![image](https://github.com/vishal-dharm/large_dashboard_warning_automation/assets/61256217/a220f212-8049-48e4-9d01-cf0be371b750)

Please note, you should inform your users before running this automation as it will make changes to their dashboards.

## Background

One of the biggest contributors to poor dashboard and, in general, Looker performance is large dashboards. There is no hard and fast rule about the number, since the design of a single element impacts its memory consumption based on a few factors. However, a good rule of thumb to avoid poor performance is to avoid creating dashboards with 25 or more queries. 

Keep dashboard performance slick by creating navigation links between dashboards or by [creating links to custom URLs](https://cloud.google.com/looker/docs/reference/param-field-link) to create a curated navigation from dashboard to dashboard. You can also try concatenating similar measures into the same single value visualization to avoid many single tile visualizations ([ref](https://cloud.google.com/looker/docs/best-practices/considerations-when-building-performant-dashboards)).

## Automation

To automate this process, you can put this script in a [Cloud Function](https://cloud.google.com/functions) and trigger it at the desired cadence with [Cloud Scheduler](https://cloud.google.com/scheduler), as detailed in the [Cloud Function Content Cleanup example](/cloud-function-content-cleanup-automation/README.md).

## Caveat

Before running this script on your production Looker instance, you should strongly consider adding:
* error handling
* retry logic
* a check to see if there's already a warning text on the dashboard