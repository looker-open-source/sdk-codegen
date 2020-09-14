require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

# adding metrics for our validation summary
error_messages = Array.new()
model_with_errors = Array.new()
look_with_errors, dashboard_with_errors = 0, 0

content_validated = sdk.content_validation()

# iterate through the response to print it individually and calculate summary
content_validated[:content_with_errors].each { |content|
	content[:errors].each { |error|
		if content[:look].nil?
			puts "\nContent from Dashboard with ID: #{content[:dashboard][:id]}"
			dashboard_with_errors += 1
		else
			puts "Content from Look with ID: #{content[:look][:id]}"
			look_with_errors += 1
		end
		puts "Error Message:\t #{error[:message].inspect}"
		puts "in Model:\t #{error[:model_name].inspect}"
		error_messages.push(error[:message].inspect)
		model_with_errors.push(error[:model_name].inspect)
	}

}
puts "\n"
puts "*"*60
puts "SUMMARY:"

# list to dictionary to keep unique values and count occurences
dict_errors = error_messages.group_by{|e| e}.map{|k, v| [k, v.length]}.to_h
dict_models = model_with_errors.group_by{|e| e}.map{|k, v| [k, v.length]}.to_h


puts "\nErrors encountered:"
puts dict_errors.map{ |k,v| "#{k} => #{v}" }.sort.reverse
puts "\nModels with Errors:"
puts dict_models.map{ |k,v| "#{k} => #{v}" }.sort.reverse

puts "\n\n"
puts "The Content Validator found #{error_messages.size} errors in total for: "
puts "\t - #{look_with_errors} Looks"
puts "\t - #{dashboard_with_errors} Dashboards"
puts "\t - #{model_with_errors.uniq!.size} Models"
puts "*"*60
