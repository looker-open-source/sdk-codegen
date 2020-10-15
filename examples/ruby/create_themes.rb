require 'looker-sdk'

# get API creds from environment variables
sdk = LookerSDK::Client.new(
  :client_id => ENV['LOOKERSDK_CLIENT_ID'],
  :client_secret => ENV['LOOKERSDK_CLIENT_SECRET'],
  :api_endpoint => ENV['LOOKERSDK_BASE_URL']
)
​
# NOTE: Custom themes needs to be enabled by Looker. 
# Unless custom themes are enabled, only the automatically generated default theme can be used. 
# Please contact your Account Manager or support@looker.com to update your license for this feature.

# Example formatting for the theme details to be created
#  example_custom_theme = {
# 	 	:name=> "my_custom_theme",
# 	  	:settings=> {
# 	    	:background_color=> "#d8e2f2",
# 		    :base_font_size=> "12px",
# 		    :color_collection_id=> "",
# 		    :font_color=> "#143f85",
# 		    :font_family=> "Arial",
# 		    :font_source=> "",
# 		    :info_button_color=> "#0087e1",
# 		    :primary_button_color=> "#64518a",
# 		    :show_filters_bar=> true,
# 		    :show_title=> true,
# 		    :text_tile_text_color=> "",
# 		    :tile_background_color=> "#efaa3b",
# 		    :tile_text_color=> "#3a4245",
# 		    :title_color=> "#7d0f48",
# 		    :warn_button_color=> "#980c11"
# 	  }
# 	}
​
# these are general examples and not necessarily themes that follow the brand guidelines for these companies
airbnb_like = {:name=>"airbnb", :settings=>{:background_color=>"#faf3f2", :base_font_size=>"12px", :color_collection_id=>"5f313589-67ce-44ba-b084-ec5107a7bb7e", :font_color=>"#143f85", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#0087e1", :primary_button_color=>"#FF5A5F", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"", :tile_background_color=>"#faf3f2", :tile_text_color=>"#FF5A5F", :title_color=>"#FF5A5F", :warn_button_color=>"#980c11"}}
gcp_like = {:name=>"gcp", :settings=>{:background_color=>"#ffffff", :base_font_size=>"12px", :color_collection_id=>"", :font_color=>"#4385f5", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#fcbc05", :primary_button_color=>"#4385f5", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"", :tile_background_color=>"#ffffff", :tile_text_color=>"#4385f5", :title_color=>"#4385f5", :warn_button_color=>"#ea4136"}}
aws_like = {:name=>"aws", :settings=>{:background_color=>"#000000", :base_font_size=>"12px", :color_collection_id=>"", :font_color=>"#ff9900", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#FFAC31", :primary_button_color=>"#FFAC31", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"", :tile_background_color=>"#000000", :tile_text_color=>"#ff9900", :title_color=>"#ff9900", :warn_button_color=>"#ffc46d"}}
microsoft_like = {:name=>"microsoft", :settings=>{:background_color=>"#ffffff", :base_font_size=>"12px", :color_collection_id=>"80e60a97-c02b-4a41-aa05-83522ee2144b", :font_color=>"#3a5998", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#FFB900", :primary_button_color=>"#00A4EF", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"#7FBA00", :tile_background_color=>"#ffffff", :tile_text_color=>"#F25022", :title_color=>"#737373", :warn_button_color=>"#3a5998"}}
facebook_like = {:name=>"facebook", :settings=>{:background_color=>"#f6f6f6", :base_font_size=>"12px", :color_collection_id=>"", :font_color=>"#3a5998", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#3a5998", :primary_button_color=>"#3a5998", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"", :tile_background_color=>"#f6f6f6", :tile_text_color=>"#8b9dc3", :title_color=>"#4385f5", :warn_button_color=>"#3a5998"}}
datadog_like = {:name=>"datadog", :settings=>{:background_color=>"#fdf0ff", :base_font_size=>"12px", :color_collection_id=>"5b121cce-cf79-457c-a52a-9162dc174766", :font_color=>"#774aa4", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#774aa4", :primary_button_color=>"#774aa4", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"", :tile_background_color=>"#fdf0ff", :tile_text_color=>"#774aa4", :title_color=>"#774aa4", :warn_button_color=>"#774aa4"}}
strava_like = {:name=>"strava", :settings=>{:background_color=>"#fff8f5", :base_font_size=>"12px", :color_collection_id=>"7c79334a-9912-4ca1-be6a-35756782ae09", :font_color=>"#FC4C02", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#FC4C02", :primary_button_color=>"#FC4C02", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"", :tile_background_color=>"#fff8f5", :tile_text_color=>"#FC4C02", :title_color=>"#FC4C02", :warn_button_color=>"#FC4C02"}}
sendgrid_like =  {:name=>"sendgrid", :settings=>{:background_color=>"#f6f6f6", :base_font_size=>"12px", :color_collection_id=>"1bc1f1d8-7461-4bfd-8c3b-424b924287b5", :font_color=>"#1A82e2", :font_family=>"Arial", :font_source=>"", :info_button_color=>"#294661", :primary_button_color=>"#294661", :show_filters_bar=>true, :show_title=>true, :text_tile_text_color=>"", :tile_background_color=>"#f6f6f6", :tile_text_color=>"#1A82e2", :title_color=>"#1A82e2", :warn_button_color=>"#294661"}}
​
all_themes = [airbnb_like, gcp_like, aws_like, microsoft_like, facebook_like, datadog_like, strava_like, sendgrid_like]
​
# pull the list of themes we created above and create them all in our instance
all_themes.each { | theme|
	sdk.create_theme(theme)
}


