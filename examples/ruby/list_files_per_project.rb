require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)

overall_file_types = Array.new
all_projects = sdk.all_projects(:fields => 'id')

# iterate through all projects
all_projects.each { |project|


  file_types = Array.new
  puts "\n"
  puts "*"*60
  puts "Project: #{project[:id]}"

  project_files_list = sdk.all_project_files(project[:id], :fields => 'id, type, path')
  project_files_list.each { |file|

    # add the type to the array to count later on
    file_types.push(file[:type])
    overall_file_types.push(file[:type])

  }

  # get a count of each individual value in the array
  file_types_counted = file_types.group_by{|e| e}.map{|k, v| [k, v.length]}.to_h
  puts file_types_counted.map{ |k,v| "#{k} => #{v}" }.sort.reverse

}

puts "\n"
puts "*"*60
puts "SUMMARY: "
all_types_counted = overall_file_types.group_by{|e| e}.map{|k, v| [k, v.length]}.to_h
puts all_types_counted.map{ |k,v| "#{k} => #{v}" }.sort.reverse
puts "*"*60
