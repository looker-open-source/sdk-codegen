require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

all_projects = sdk.all_projects()

# iterate thru all projects 
all_projects.each { |project|
	puts "Project name '#{project[:name]}' has the following branches:"
	all_branches = sdk.all_git_branches(project[:id], :fields => 'name, personal')
  
  # find all the branches
  all_branches.each { |branch|
		if branch[:personal]
			puts branch[:name].concat(" : Personal Branch")
		else
			branch[:name] == "master" ? (puts "#{branch[:name]} : Production Branch") : (puts "#{branch[:name]} : Shared Branch")
			
	end
	}
	puts "\n"
}
