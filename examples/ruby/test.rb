require 'looker-sdk'

puts ENV['LOOKERSDK_CLIENT_ID']
puts ENV['LOOKERSDK_CLIENT_SECRET']
puts ENV['LOOKERSDK_BASE_URL']

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

puts sdk.me().to_s