require 'looker-sdk'
require 'aws-sdk-s3'
require 'securerandom'

sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

#define all the variables for Looker and S3 credentials
$query_id_for_look = 14964 # update the query id for the query of the Look to use
$access_key_id = "REPLACE_WITH_YOUR_IAM_KEY_ID"
$secret_access_key = "REPLACE_WITH_YOUR_IAM_SECRET_ACCESS"
$unique_name = SecureRandom.hex

schedule_hash = {
    :name=>$unique_name,
    :query_id => $query_id_for_look,
    :run_once => true,
    :send_all_results => true,
    :scheduled_plan_destination=>[{
        :format=>"csv",
        :apply_formatting=>false,
        :address=>"s3://looker-api-schedules",
        :type=>"s3",
        :parameters=>"{\"region\":\"us-east-1\",\"access_key_id\":\"#{access_key_id}\"",
        :secret_parameters=>"{\"secret_access_key\":\"#{secret_access_key}\"}"
      }]
    }

#create the schedule
schedule = sdk.scheduled_plan_run_once(schedule_hash).inspect

#wait to run the next code to make sure that schedule has been created
sleep(3)

#get all the running queries and then loop through them to find the task assocaited with our schedule
running_queries = sdk.all_running_queries()

running_queries.each do |query|
  if query[:query_id] == $query_id_for_look
     $query_task = query[:query_task_id]
  end
end


$status = sdk.query_task($query_task)

#poll the query task until it is done before we go get it from s3
while true
  if $status[:status] == "complete"
    break
  end
  $status = sdk.query_task($query_task)
end


s3 = Aws::S3::Resource.new(region: 'us-east-1')
bucket = s3.bucket('bucket_name')


#loop through the bucket and find the file that we created, we check to see if the unique name is in the filename
bucket.objects.limit(1000).each do |item|
  if item.key.include? $unique_name
    $file_name = item.key
  end
end


# Create the object to retrieve
obj = s3.bucket('looker-api-schedules').object($file_name)

# Get the item's content and save it to a file
obj.get(response_target: './output.csv')
