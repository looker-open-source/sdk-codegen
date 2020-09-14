require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

# get info for all users for these fields
details_for_users = sdk.all_users(:fields => 'id, first_name, last_name, credentials_email, credentials_totp,
					credentials_ldap, credentials_google, credentials_saml, credentials_oidc,
					credentials_api3, crendentials_embed, credentials_looker_openid, sessions')

# go through the users to get out output
details_for_users.each { |user|
	user.each { | creds |
		unless creds[1].inspect.nil?
			if creds[1].class.to_s == 'Sawyer::Resource'

				user_name = user[:first_name].to_s + " " + user[:last_name].to_s
				puts "User #{user_name} with User ID: #{user[:id]}"  unless creds[1][:email].nil?
				puts "Auth type: #{creds[0]} for email #{creds[1][:email].inspect}\n" unless creds[1][:email].nil?

			end
		end
	}
}

puts "\nThere are #{details_for_users.length} users in the instance."
