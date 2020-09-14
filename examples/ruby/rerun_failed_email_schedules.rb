require 'looker-sdk'
require 'date'
require 'json'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

# retrieve the content for the look listing failed schedule job (in this case look_id = 120)
# look is generated from the i__looker model so user creating it needs to be an ADMIN user
# https://COMPANY.looker.com/explore/i__looker/scheduled_plan?fields=scheduled_job.status,scheduled_plan.id,scheduled_job.created_date,scheduled_plan_destination.format,scheduled_plan_destination.type,scheduled_job.status_detail&f[scheduled_plan.run_once]=no&f[scheduled_job.status]=failure&f[scheduled_plan_destination.type]=email&f[scheduled_job.created_date]=this+week&sorts=scheduled_job.created_date,scheduled_plan.id+desc&limit=500
failed_schedules = sdk.run_look(120, "json")


failed_schedules.each { |schedule|
  puts "*"*60
  puts "The schedule #{schedule["scheduled_plan.id"]} failed:"
  puts "\tDate:\t #{schedule["scheduled_job.created_date"]}"
  puts "\tError:\t #{schedule["scheduled_job.status_detail"]}"
  puts "\tRecipients: #{schedule["scheduled_plan.destination_addresses"]}"
  puts "\tFormat:\t #{schedule["scheduled_plan_destination.format"]}\n"


  puts "\nGetting details of the failed schedule"
  old_schedule = sdk.scheduled_plan(schedule["scheduled_plan.id"])

  print "\nRe-scheduling the content now to the same email"
  rerun_date = " - reran from API on ".concat(Date.today.to_s)

  new_schedule = old_schedule
  new_schedule[:title] = new_schedule[:title].concat(rerun_date)
  new_schedule[:name] = new_schedule[:name].concat(rerun_date)
  new_schedule[:id] = nil
  # so the schedule is associated with the API user for the script
  new_schedule[:user] = nil

  run_it = sdk.scheduled_plan_run_once(new_schedule.to_h.to_json)
  puts "\t✅ - Sent"
}
