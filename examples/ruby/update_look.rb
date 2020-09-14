require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

# get look, here look id 32
my_look = sdk.look(32)

# get query id for look
my_query = sdk.query(my_look.query_id).to_attrs

# set new filters, here update the value for order_id
my_query[:filters] =  {:"order_items.order_id" => "<567"}

# remove the client id!
my_query[:client_id] = {}

# create a new query
my_new_query = sdk.create_query(my_query)
puts "New Query ID: " + my_new_query[:id].to_s

# update look with new query
my_look = sdk.update_look(32, :query_id => my_new_query[:id])
puts "Updated Look Query ID: " + my_look[:query_id].to_s


if my_new_query[:id] == my_look[:query_id]
  puts "Success!"
else
  puts "Fail again, fail better"
end
