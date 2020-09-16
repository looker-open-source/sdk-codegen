require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

all_integrations = sdk.all_integrations(:fields => 'id, label, enabled')

all_integrations.each { | integration |
  begin
  testing = sdk.test_integration(integration[:id])
    puts testing[:success] ?  "Test OK\t\t#{integration[:label]}" :  "Not Enabled\t#{integration[:label]}"
  rescue
    not_enabled = "Error with test for integration #{integration[:label]}"
    puts !integration[:enabled] ? not_enabled : "Unknown error\t#{integration[:label]}"
  end
}
