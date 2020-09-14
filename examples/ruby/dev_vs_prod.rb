require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

# Get the user input to test the Look (could be changed to read a file, or a list of looks to test)
puts "Please enter the Look ID to use for the test?"
look_to_get = gets.chomp


# get look, and its attributes
my_look = sdk.look(look_to_get)
look_title = my_look["title"].to_s
look_id = my_look["id"].to_s
current_session = sdk.session["workspace_id"]

puts "Testing the Look '#{look_title}', with ID '#{look_id}' for #{current_session} branch."

# depending on the content used for testing, may need to use additional args for run_look():
# https://docs.looker.com/reference/api-and-integration/api-reference/look#run_look
# rebuild_pdts: true ?

prod_branch_results = sdk.run_look(look_to_get, 'csv', force_production: true)
prod_branch_query = sdk.run_look(look_to_get, 'sql', force_production: true)

# Changing to Dev branch to run the look there
puts "Changing to dev mode."
sdk.update_session("workspace_id": "dev")
current_session =  sdk.session["workspace_id"]

puts "Testing the Look '#{look_title}', with ID '#{look_id}' for #{current_session} branch."
dev_branch_results = sdk.run_look(look_to_get, 'csv', force_production: false)
dev_branch_query = sdk.run_look(look_to_get, 'sql', force_production: false)


if prod_branch_results == dev_branch_results
  puts "Success! Production data matches your dev mode data."
else
  # let's get some details on values and queries
  File.open("production_output.csv", 'w') { |file| file.write(prod_branch_results) }
  File.open("production_query.txt", 'w') { |file| file.write(prod_branch_query) }

  File.open("development_output.csv", 'w') { |file| file.write(dev_branch_results) }
  File.open("development_query.txt", 'w') { |file| file.write(dev_branch_query) }
  puts "The outputs are not identical, please check out the output files for details"
end
