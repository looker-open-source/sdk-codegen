require 'looker-sdk'

# This function requires prior settings on the Looker instance for the Action Hub and Google Cloud Storage
# https://docs.looker.com/admin-options/platform/actions#how_to_enable_an_action

def send_csv_to_gcs
    sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
    )

  response = sdk.look(487) # change this id with the id of the Look you want to send to GCS
  $query_id_for_look = response[:query_id].inspect
  $filename = "historybackup_" + Time.now.strftime("%Y%m%d").to_s

  schedule_hash = {
    :name=>$filename,
    :query_id => $query_id_for_look,
    :run_once => true,
    :require_results => false,
    :require_no_results => false,
    :require_change => false,
    :send_all_results => false,
    :scheduled_plan_destination => [{
      :format => "csv",
      :apply_formatting => false,
      :address => "",
      :type => "looker-integration://1::google_cloud_storage",
      :parameters => "{\"bucket\":\"backupforlooker\",\"filename\":\"#{$filename}\"}"
	      }]
	    }
      # replace 'backupforlooker' with the name of your bucket

  #create and run the schedule
  schedule = sdk.scheduled_plan_run_once(schedule_hash).inspect

  puts "Schedule to Google Cloud Storage processed."
end
