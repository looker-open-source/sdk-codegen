# Ruby Examples for the Looker API

You can find Ruby language examples in this folder.

Using Looker docs: https://docs.looker.com/reference/api-and-integration/api-reference  
Using official Looker Ruby SDK: https://github.com/looker-open-source/looker-sdk-ruby

Use cases with Looker API:

---

### USERS 👤

- Logout all users on the instance [[link]](logout_all_users.rb)
- Disable users in the instance [[link]](disable_users.rb)
- Get a list of all users and their auth credentials [[link]](users_list_and_auth_types.rb)
- Add all users to a group [[link]](all_users_to_group.rb)

---

### CODE 💾

- Get a list of all the Git branches in the projects [[link]](all_git_branches.rb)
- Validates the Looker **Projects** (LookML) [[link]](validate_projects.rb)
- Get a list of all files per projects [[link]](list_files_per_project.rb)

---

### DELIVERY 📩

- Render a Look as in PNG format [[link]](render_look_png.rb)
- Create a schedule to run once to Google Cloud Storage [[link]](schedule_once_to_gcs.rb)
- Stream results to S3 bucket [[link]](stream_to_s3.rb)
- Re-run the failed schedules to email [[link]](rerun_failed_email_schedules.rb)
- Download all dashboard tiles as standalone CSV files [[link]](download_dashboard.rb#L12-L33)
- Download all dashboard tiles as tabs in one Excel file [[link]](download_dashboard.rb#L36-L65)
- Test the integrations [[link]](test_integrations.rb)

---

### CONTENT 📊

- Template to update Look [[link]](update_look.rb)
- Automated testing for Look output between Development mode and Production mode [[link]](dev_vs_prod.rb)
- Validates the Looker **Content** [[link]](validate_content.rb)
- Delete old Looks [[link]](delete_unused_content.rb)

---

### OTHER 🌐

- Kill all running queries in the instance [[link]](kill_all_running_queries.rb)
- Test database connections [[link]](test_all_connections.rb)
- Create Looker Themes for your dashboards [[link]](create_themes.rb)
