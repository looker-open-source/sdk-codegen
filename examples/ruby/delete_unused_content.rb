require 'looker-sdk'
require 'time'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

# replace with the number of days you want
$what_is_old = 360

all_looks = sdk.all_looks(:fields => 'id, title, last_accessed_at, user')
all_looks.each { | look |
	unless look[:last_accessed_at].nil?
		if (Time.now.utc - look[:last_accessed_at]) /60/60/24 > $what_is_old
			sdk.delete_look(look[:id])
			puts "Look: #{look[:title].capitalize} was deleted!\tLast accessed #{((Time.now.utc-look[:last_accessed_at])/60/60/24 ).ceil} days ago"
		end
	end
}
