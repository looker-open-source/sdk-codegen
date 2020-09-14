require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

def test_all_connections(looker)
  all_connections = looker.all_connections(:fields => 'name, port, host, dialect(connection_tests, label)')
  test_results = []

  all_connections.each { | connection |
    puts "Processing connection tests for \"#{connection[:name]}\""
    begin
      tests_to_run = connection[:dialect][:connection_tests].join(',')

      testing = looker.test_connection(connection[:name], {}, tests: tests_to_run)
      testing.each { | test |
        if test[:status] != "success"
          test_results << "Connection \"#{connection[:name]}\" (#{connection[:dialect][:label]}) has #{test[:status]}!"
        end
      }
    rescue
      test_results <<  "Uncaught error in testing connection \"#{connection[:name]}\""
    end
  }
  puts "\n**********"
  return test_results
end

puts test_all_connections(sdk)
