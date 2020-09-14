require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

# adding metrics for our validation summary
validating_count = 0
validation_timing = Array.new

all_projects = sdk.all_projects(:fields => 'id')

# iterate through all projects
all_projects.each { |project|
	puts "\n"
	puts "Validating project #{project[:id]} :"

	# run the validator on the project to get the errors and time taken
	all_validation_output = sdk.validate_project(project[:id], :fields => 'errors,computation_time')
		all_validation_output[:errors].each { |error|
				puts error.inspect
		}

validating_count += 1
validation_timing.push(all_validation_output[:computation_time])

puts "Total computation time for #{all_validation_output[:errors].size} errors was #{all_validation_output[:computation_time]}"
}

# summary from validation:
avg_runtime_validation = validation_timing.inject{ |sum, el| sum + el }.to_f / validation_timing.size

puts "\nValidation performed #{validating_count} times"
puts "Average runtime for the validation was #{avg_runtime_validation}"
