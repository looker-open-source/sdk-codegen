require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

all_running_queries = sdk.all_running_queries()
all_running_queries.each { |item|
	puts "Killing query: #{item[:query_task_id]} from #{item[:source].to_s.capitalize}"
	sdk.kill_query(item[:query_task_id])
	}
