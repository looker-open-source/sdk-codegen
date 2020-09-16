require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

all_groups = sdk.all_groups(:fields => 'id, name')
all_groups.each { |group|
  #change this value below to match exactly the group name you want
	if group[:name] == "Custom Fields Beta Users"
		puts "Group \"#{group[:name]}\" has ID #{group[:id]}"
		$group_id = group[:id]
	end
}

all_users = looker.all_users(:fields => 'id, email')
all_users.each { |user|
	body = {"user_id": user[:id]}
	looker.add_group_user($group_id, body)
	# puts "User: #{user[:email].to_s.capitalize} with ID #{user[:id]} was added to the Group"
}
