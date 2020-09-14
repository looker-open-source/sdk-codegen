require 'looker-sdk'
require 'xlsxtream' # https://github.com/felixbuenemann/xlsxtream

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)


def one_csv_per_tile(dashboard_to_export, looker)
#function to download the results for each dashboard query as its own csv file
	begin
		dash_info = looker.dashboard(dashboard_to_export)
	rescue StandardError => msg
		puts "#{msg}"
		puts "⚠️\tDashboard ID Not Found"
	end

		dash_info[:dashboard_elements].each { | dashboardelem |

			unless dashboardelem[:resultmaker].nil? && dashboardelem[:type] != "vis"

				query_id =  dashboardelem[:result_maker][:query_id]
				$cleaned_tile_title = dashboardelem[:title].gsub(/[^0-9a-z ]/i, '').gsub(/[ ]/i, '_')
				results = looker.run_query(query_id, "csv")

				puts "Processing results for tile: #{$cleaned_tile_title}..."
				File.open("#{$cleaned_tile_title}.csv", 'w') { |file| file.write(results) }
			end
		}
end


def one_excel_for_dash(dashboard_to_export, looker)
#function to download the results for each dashboard query as a tab in one Excel file
	begin
		dash_info = looker.dashboard(dashboard_to_export)
	rescue StandardError => msg
		puts "#{msg}"
		puts "⚠️\tDashboard ID Not Found"
	end
	$cleaned_dash_title = dash_info[:title].gsub(/[^0-9a-z ]/i, '').gsub(/[ ]/i, '_')

	Xlsxtream::Workbook.open("#{$cleaned_dash_title}.xlsx") do | xlsx |

		dash_info[:dashboard_elements].each { | dashboardelem |

			unless dashboardelem[:resultmaker].nil? && dashboardelem[:type] != "vis"

				query_id =  dashboardelem[:result_maker][:query_id]
				$cleaned_tile_title = dashboardelem[:title].gsub(/[^0-9a-z ]/i, '').gsub(/[ ]/i, '_')
				results = looker.run_query(query_id, "csv")

				puts "Processing results for tile: #{$cleaned_tile_title}..."
				xlsx.write_worksheet "#{$cleaned_tile_title}" do | sheet |
					results.each_line do | line |
						sheet << line.split(',')
					end
				end
			end
		}
	end
end

# change the number below to match the id of the dashboard to download
dashboard_to_export = 23

# uncomment the function you need
# one_csv_per_tile(dashboard_to_export, sdk)
# one_excel_for_dash(dashboard_to_export, sdk)
