//
//  modelsTests.swift
//  lookerTests
//
//  Created by John Kaster on 10/29/19.
//

import XCTest

@testable import looker

let jsonUser = #"""
{"avatar_url":"https://gravatar.lookercdn.com/avatar/b43233285920a00e57afc39645990ff8?s=156\u0026d=blank","avatar_url_without_sizing":"https://gravatar.lookercdn.com/avatar/b43233285920a00e57afc39645990ff8?d=blank","credentials_api3":[{"id":1,"client_id":"8GMCtkjqwcNHrYMS56qj","created_at":"2018-03-15T13:16:34.692-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/1","can":{}},{"id":2,"client_id":"MwTqW8bzShCs5v5xhRgV","created_at":"2018-07-25T15:08:47.177-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/2","can":{}},{"id":3,"client_id":"vrbmjbbCQcbMxX85DNKk","created_at":"2018-07-25T15:55:10.997-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/3","can":{}},{"id":4,"client_id":"ZfzcH9MR9k5m5zPM4Qjc","created_at":"2018-08-01T18:27:32.114-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/4","can":{}},{"id":5,"client_id":"SSTnPRGrKbMDXjf7Q6N2","created_at":"2018-08-02T12:29:48.655-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/5","can":{}},{"id":6,"client_id":"PNvnYd88DK4vGMpQ96kZ","created_at":"2018-08-02T13:32:43.836-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/6","can":{}},{"id":7,"client_id":"5ffJjVKF7rvq9mnDs6QJ","created_at":"2018-12-19T14:20:06.498-08:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/7","can":{}},{"id":8,"client_id":"DcHCzdHKmJwkrdX7DZwZ","created_at":"2019-01-30T16:51:24.201-08:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/8","can":{}},{"id":9,"client_id":"B8M9nty4Jhgcw9nTcw5Y","created_at":"2019-03-15T19:40:13.420-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/9","can":{}},{"id":10,"client_id":"PrJmzcCGdJksGqc5qRCq","created_at":"2019-03-18T10:35:00.065-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/10","can":{}},{"id":11,"client_id":"ZkXtT6brKSkxB2H2BTK5","created_at":"2019-03-26T20:55:20.232-07:00","type":"api3","is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_api3/11","can":{}}],"credentials_email":{"created_at":"2017-07-18T09:31:05.778-07:00","logged_in_at":"2019-09-25T07:07:20.028-07:00","type":"email","email":"john.kaster@looker.com","forced_password_reset_at_next_login":false,"is_disabled":false,"password_reset_url":null,"url":"https://localhost:19999/api/3.1/users/1/credentials_email","user_url":"https://localhost:19999/api/3.1/users/1","can":{"show_password_reset_url":true}},"credentials_embed":[],"credentials_google":null,"credentials_ldap":null,"credentials_looker_openid":null,"credentials_oidc":null,"credentials_saml":null,"credentials_totp":{"created_at":"2018-07-02T15:36:07.800-07:00","type":"two-factor","verified":false,"is_disabled":false,"url":"https://localhost:19999/api/3.1/users/1/credentials_totp","can":{}},"email":"john.kaster@looker.com","first_name":"John","home_space_id":"1","id":1,"last_name":"Kaster","locale":"psbrackets_pseudo","looker_versions":["4.19.0","4.21.0","4.23.0","5.1.0","5.11.0","5.13.0","5.15.0","5.17.0","5.19.0","5.21.0","5.22.3","5.23.0","5.25.0","5.3.0","5.5.0","5.7.0","5.9.0","6.1.0","6.11.0","6.15.0","6.17.0","6.19.0","6.2.0","6.21.0","6.23.0","6.3.0","6.5.0","6.7.0","6.9.0"],"models_dir_validated":false,"personal_space_id":5,"ui_state":{"homepageGroupIdPreference":1},"embed_group_space_id":null,"home_folder_id":"1","personal_folder_id":5,"presumed_looker_employee":true,"sessions":[],"verified_looker_employee":false,"roles_externally_managed":false,"display_name":"John Kaster","group_ids":[1,3],"is_disabled":false,"role_ids":[2],"url":"https://localhost:19999/api/3.1/users/1","can":{"show":true,"index":true,"show_details":true,"index_details":true,"sudo":false}}
"""#

let jsonDashboard2 = #"""
{"content_metadata_id":8,"description":null,"hidden":false,"id":2,"query_timezone":null,"readonly":false,"refresh_interval":null,"refresh_interval_to_i":null,"space":{"child_count":0,"content_metadata_id":5,"creator_id":1,"external_id":null,"id":5,"is_embed":false,"is_embed_shared_root":false,"is_embed_users_root":false,"is_personal":true,"is_personal_descendant":false,"is_shared_root":false,"is_users_root":false,"name":"John Kaster","parent_id":2,"can":{"index":true,"show":true,"create":true,"see_admin_spaces":true,"update":false,"destroy":false,"move_content":true,"edit_content":true}},"title":"Brands","user_id":1,"background_color":null,"created_at":"2017-09-18T17:29:12.757-07:00","dashboard_elements":[{"body_text":null,"body_text_as_html":null,"dashboard_id":2,"edit_uri":null,"id":2,"look":null,"look_id":null,"lookml_link_id":null,"merge_result_id":null,"note_display":null,"note_state":null,"note_text":null,"note_text_as_html":null,"query":{"id":638,"view":"inventory_items","fields":["products.brand_name","products.count"],"pivots":null,"fill_fields":null,"filters":null,"filter_expression":null,"sorts":["products.count desc"],"limit":"500","column_limit":"50","total":null,"row_total":null,"subtotals":null,"runtime":0.011783,"vis_config":{"stacking":"","show_value_labels":false,"label_density":25,"legend_position":"center","x_axis_gridlines":false,"y_axis_gridlines":true,"show_view_names":true,"limit_displayed_rows":false,"y_axis_combined":true,"show_y_axis_labels":true,"show_y_axis_ticks":true,"y_axis_tick_density":"default","y_axis_tick_density_custom":5,"show_x_axis_label":true,"show_x_axis_ticks":true,"x_axis_scale":"auto","y_axis_scale_mode":"linear","ordering":"none","show_null_labels":false,"show_totals_labels":false,"show_silhouette":false,"totals_color":"#808080","type":"looker_column","show_row_numbers":true,"truncate_column_names":false,"hide_totals":false,"hide_row_totals":false,"table_theme":"editable","enable_conditional_formatting":false,"conditional_formatting_ignored_fields":[],"conditional_formatting_include_totals":false,"conditional_formatting_include_nulls":false,"series_types":{}},"filter_config":{},"visible_ui_sections":null,"slug":"N7Mxs6d","dynamic_fields":null,"client_id":"IqChgMXN18behyDJLzAD31","share_url":"https://self-signed.looker.com:9999/x/IqChgMXN18behyDJLzAD31","expanded_share_url":"https://self-signed.looker.com:9999/explore/thelook/inventory_items?fields=products.brand_name,products.count\u0026sorts=products.count+desc\u0026limit=500\u0026column_limit=50\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22type%22%3A%22looker_column%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D\u0026origin=share-expanded","url":"/explore/thelook/inventory_items?fields=products.brand_name,products.count\u0026sorts=products.count+desc\u0026limit=500\u0026column_limit=50\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22type%22%3A%22looker_column%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D","query_timezone":null,"has_table_calculations":false,"model":"thelook","can":{"run":true,"see_results":true,"explore":true,"create":true,"show":true,"cost_estimate":true,"index":true,"see_lookml":true,"see_derived_table_lookml":true,"see_sql":true,"generate_drill_links":true,"download":true,"render":true}},"query_id":638,"refresh_interval":null,"refresh_interval_to_i":null,"result_maker_id":15,"subtitle_text":null,"title":"Brand Product Count","title_hidden":false,"title_text":null,"type":"vis","alert_count":null,"result_maker":{"id":15,"dynamic_fields":null,"filterables":[{"model":"thelook","view":"inventory_items","name":null,"listen":[{"dashboard_filter_name":"Brand A","field":"products.category"},{"dashboard_filter_name":"Brand B","field":"products.brand"}]}],"sorts":["products.count desc"],"merge_result_id":null,"total":null,"query_id":638,"query":{"id":638,"view":"inventory_items","fields":["products.brand_name","products.count"],"pivots":null,"fill_fields":null,"filters":null,"filter_expression":null,"sorts":["products.count desc"],"limit":"500","column_limit":"50","total":null,"row_total":null,"subtotals":null,"runtime":0.011783,"vis_config":{"stacking":"","show_value_labels":false,"label_density":25,"legend_position":"center","x_axis_gridlines":false,"y_axis_gridlines":true,"show_view_names":true,"limit_displayed_rows":false,"y_axis_combined":true,"show_y_axis_labels":true,"show_y_axis_ticks":true,"y_axis_tick_density":"default","y_axis_tick_density_custom":5,"show_x_axis_label":true,"show_x_axis_ticks":true,"x_axis_scale":"auto","y_axis_scale_mode":"linear","ordering":"none","show_null_labels":false,"show_totals_labels":false,"show_silhouette":false,"totals_color":"#808080","type":"looker_column","show_row_numbers":true,"truncate_column_names":false,"hide_totals":false,"hide_row_totals":false,"table_theme":"editable","enable_conditional_formatting":false,"conditional_formatting_ignored_fields":[],"conditional_formatting_include_totals":false,"conditional_formatting_include_nulls":false,"series_types":{}},"filter_config":{},"visible_ui_sections":null,"slug":"N7Mxs6d","dynamic_fields":null,"client_id":"IqChgMXN18behyDJLzAD31","share_url":"https://self-signed.looker.com:9999/x/IqChgMXN18behyDJLzAD31","expanded_share_url":"https://self-signed.looker.com:9999/explore/thelook/inventory_items?fields=products.brand_name,products.count\u0026sorts=products.count+desc\u0026limit=500\u0026column_limit=50\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22type%22%3A%22looker_column%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D\u0026origin=share-expanded","url":"/explore/thelook/inventory_items?fields=products.brand_name,products.count\u0026sorts=products.count+desc\u0026limit=500\u0026column_limit=50\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22type%22%3A%22looker_column%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D","query_timezone":null,"has_table_calculations":false,"model":"thelook","can":{"run":true,"see_results":true,"explore":true,"create":true,"show":true,"cost_estimate":true,"index":true,"see_lookml":true,"see_derived_table_lookml":true,"see_sql":true,"generate_drill_links":true,"download":true,"render":true}},"vis_config":{"stacking":"","show_value_labels":false,"label_density":25,"legend_position":"center","x_axis_gridlines":false,"y_axis_gridlines":true,"show_view_names":true,"limit_displayed_rows":false,"y_axis_combined":true,"show_y_axis_labels":true,"show_y_axis_ticks":true,"y_axis_tick_density":"default","y_axis_tick_density_custom":5,"show_x_axis_label":true,"show_x_axis_ticks":true,"x_axis_scale":"auto","y_axis_scale_mode":"linear","ordering":"none","show_null_labels":false,"show_totals_labels":false,"show_silhouette":false,"totals_color":"#808080","type":"looker_column","show_row_numbers":true,"truncate_column_names":false,"hide_totals":false,"hide_row_totals":false,"table_theme":"editable","enable_conditional_formatting":false,"conditional_formatting_ignored_fields":[],"conditional_formatting_include_totals":false,"conditional_formatting_include_nulls":false,"series_types":{}}},"can":{"create":true,"update":true,"destroy":true,"index":true,"show":true,"explore":true,"run":false,"show_errors":true,"find_and_replace":true}},{"body_text":null,"body_text_as_html":null,"dashboard_id":2,"edit_uri":null,"id":3,"look":null,"look_id":null,"lookml_link_id":null,"merge_result_id":null,"note_display":null,"note_state":null,"note_text":null,"note_text_as_html":null,"query":{"id":656,"view":"inventory_items","fields":["inventory_items.id","inventory_items.days_in_inventory","inventory_items.cost"],"pivots":null,"fill_fields":null,"filters":null,"filter_expression":null,"sorts":null,"limit":"500","column_limit":null,"total":null,"row_total":null,"subtotals":null,"runtime":1.2266557216644287,"vis_config":{"stacking":"","show_value_labels":false,"label_density":25,"legend_position":"center","x_axis_gridlines":false,"y_axis_gridlines":true,"show_view_names":true,"limit_displayed_rows":false,"y_axis_combined":true,"show_y_axis_labels":true,"show_y_axis_ticks":true,"y_axis_tick_density":"default","y_axis_tick_density_custom":5,"show_x_axis_label":true,"show_x_axis_ticks":true,"x_axis_scale":"auto","y_axis_scale_mode":"linear","show_null_points":true,"point_style":"circle","interpolation":"linear","show_totals_labels":false,"show_silhouette":false,"totals_color":"#808080","ordering":"none","show_null_labels":false,"type":"looker_scatter","show_row_numbers":true,"truncate_column_names":false,"hide_totals":false,"hide_row_totals":false,"table_theme":"editable","enable_conditional_formatting":false,"conditional_formatting_ignored_fields":[],"conditional_formatting_include_totals":false,"conditional_formatting_include_nulls":false,"series_types":{}},"filter_config":{},"visible_ui_sections":null,"slug":"2stHzjm","dynamic_fields":null,"client_id":"mtSURvwNYdoI8Kne5NU5w8","share_url":"https://self-signed.looker.com:9999/x/mtSURvwNYdoI8Kne5NU5w8","expanded_share_url":"https://self-signed.looker.com:9999/explore/thelook/inventory_items?fields=inventory_items.id,inventory_items.days_in_inventory,inventory_items.cost\u0026limit=500\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22show_null_points%22%3Atrue%2C%22point_style%22%3A%22circle%22%2C%22interpolation%22%3A%22linear%22%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22type%22%3A%22looker_scatter%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D\u0026origin=share-expanded","url":"/explore/thelook/inventory_items?fields=inventory_items.id,inventory_items.days_in_inventory,inventory_items.cost\u0026limit=500\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22show_null_points%22%3Atrue%2C%22point_style%22%3A%22circle%22%2C%22interpolation%22%3A%22linear%22%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22type%22%3A%22looker_scatter%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D","query_timezone":null,"has_table_calculations":false,"model":"thelook","can":{"run":true,"see_results":true,"explore":true,"create":true,"show":true,"cost_estimate":true,"index":true,"see_lookml":true,"see_derived_table_lookml":true,"see_sql":true,"generate_drill_links":true,"download":true,"render":true}},"query_id":656,"refresh_interval":null,"refresh_interval_to_i":null,"result_maker_id":14,"subtitle_text":null,"title":"New Tile","title_hidden":false,"title_text":null,"type":"vis","alert_count":null,"result_maker":{"id":14,"dynamic_fields":null,"filterables":[{"model":"thelook","view":"inventory_items","name":null,"listen":[]}],"sorts":null,"merge_result_id":null,"total":null,"query_id":656,"query":{"id":656,"view":"inventory_items","fields":["inventory_items.id","inventory_items.days_in_inventory","inventory_items.cost"],"pivots":null,"fill_fields":null,"filters":null,"filter_expression":null,"sorts":null,"limit":"500","column_limit":null,"total":null,"row_total":null,"subtotals":null,"runtime":1.2266557216644287,"vis_config":{"stacking":"","show_value_labels":false,"label_density":25,"legend_position":"center","x_axis_gridlines":false,"y_axis_gridlines":true,"show_view_names":true,"limit_displayed_rows":false,"y_axis_combined":true,"show_y_axis_labels":true,"show_y_axis_ticks":true,"y_axis_tick_density":"default","y_axis_tick_density_custom":5,"show_x_axis_label":true,"show_x_axis_ticks":true,"x_axis_scale":"auto","y_axis_scale_mode":"linear","show_null_points":true,"point_style":"circle","interpolation":"linear","show_totals_labels":false,"show_silhouette":false,"totals_color":"#808080","ordering":"none","show_null_labels":false,"type":"looker_scatter","show_row_numbers":true,"truncate_column_names":false,"hide_totals":false,"hide_row_totals":false,"table_theme":"editable","enable_conditional_formatting":false,"conditional_formatting_ignored_fields":[],"conditional_formatting_include_totals":false,"conditional_formatting_include_nulls":false,"series_types":{}},"filter_config":{},"visible_ui_sections":null,"slug":"2stHzjm","dynamic_fields":null,"client_id":"mtSURvwNYdoI8Kne5NU5w8","share_url":"https://self-signed.looker.com:9999/x/mtSURvwNYdoI8Kne5NU5w8","expanded_share_url":"https://self-signed.looker.com:9999/explore/thelook/inventory_items?fields=inventory_items.id,inventory_items.days_in_inventory,inventory_items.cost\u0026limit=500\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22show_null_points%22%3Atrue%2C%22point_style%22%3A%22circle%22%2C%22interpolation%22%3A%22linear%22%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22type%22%3A%22looker_scatter%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D\u0026origin=share-expanded","url":"/explore/thelook/inventory_items?fields=inventory_items.id,inventory_items.days_in_inventory,inventory_items.cost\u0026limit=500\u0026vis=%7B%22stacking%22%3A%22%22%2C%22show_value_labels%22%3Afalse%2C%22label_density%22%3A25%2C%22legend_position%22%3A%22center%22%2C%22x_axis_gridlines%22%3Afalse%2C%22y_axis_gridlines%22%3Atrue%2C%22show_view_names%22%3Atrue%2C%22limit_displayed_rows%22%3Afalse%2C%22y_axis_combined%22%3Atrue%2C%22show_y_axis_labels%22%3Atrue%2C%22show_y_axis_ticks%22%3Atrue%2C%22y_axis_tick_density%22%3A%22default%22%2C%22y_axis_tick_density_custom%22%3A5%2C%22show_x_axis_label%22%3Atrue%2C%22show_x_axis_ticks%22%3Atrue%2C%22x_axis_scale%22%3A%22auto%22%2C%22y_axis_scale_mode%22%3A%22linear%22%2C%22show_null_points%22%3Atrue%2C%22point_style%22%3A%22circle%22%2C%22interpolation%22%3A%22linear%22%2C%22show_totals_labels%22%3Afalse%2C%22show_silhouette%22%3Afalse%2C%22totals_color%22%3A%22%23808080%22%2C%22ordering%22%3A%22none%22%2C%22show_null_labels%22%3Afalse%2C%22type%22%3A%22looker_scatter%22%2C%22show_row_numbers%22%3Atrue%2C%22truncate_column_names%22%3Afalse%2C%22hide_totals%22%3Afalse%2C%22hide_row_totals%22%3Afalse%2C%22table_theme%22%3A%22editable%22%2C%22enable_conditional_formatting%22%3Afalse%2C%22conditional_formatting_ignored_fields%22%3A%5B%5D%2C%22conditional_formatting_include_totals%22%3Afalse%2C%22conditional_formatting_include_nulls%22%3Afalse%2C%22series_types%22%3A%7B%7D%7D\u0026filter_config=%7B%7D","query_timezone":null,"has_table_calculations":false,"model":"thelook","can":{"run":true,"see_results":true,"explore":true,"create":true,"show":true,"cost_estimate":true,"index":true,"see_lookml":true,"see_derived_table_lookml":true,"see_sql":true,"generate_drill_links":true,"download":true,"render":true}},"vis_config":{"stacking":"","show_value_labels":false,"label_density":25,"legend_position":"center","x_axis_gridlines":false,"y_axis_gridlines":true,"show_view_names":true,"limit_displayed_rows":false,"y_axis_combined":true,"show_y_axis_labels":true,"show_y_axis_ticks":true,"y_axis_tick_density":"default","y_axis_tick_density_custom":5,"show_x_axis_label":true,"show_x_axis_ticks":true,"x_axis_scale":"auto","y_axis_scale_mode":"linear","show_null_points":true,"point_style":"circle","interpolation":"linear","show_totals_labels":false,"show_silhouette":false,"totals_color":"#808080","ordering":"none","show_null_labels":false,"type":"looker_scatter","show_row_numbers":true,"truncate_column_names":false,"hide_totals":false,"hide_row_totals":false,"table_theme":"editable","enable_conditional_formatting":false,"conditional_formatting_ignored_fields":[],"conditional_formatting_include_totals":false,"conditional_formatting_include_nulls":false,"series_types":{}}},"can":{"create":true,"update":true,"destroy":true,"index":true,"show":true,"explore":true,"run":false,"show_errors":true,"find_and_replace":true}}],"dashboard_filters":[{"id":3,"dashboard_id":2,"name":"Brand A","title":"Brand A","type":"string_filter","default_value":"A%","explore":null,"dimension":null,"row":0,"allow_multiple_values":true,"required":false,"ui_config":null,"model":"thelook","listens_to_filters":[],"field":null,"can":{"create":true,"update":true,"destroy":true,"index":true,"show":true,"show_errors":true,"find_and_replace":true}},{"id":5,"dashboard_id":2,"name":"Brand B","title":"Brand B","type":"string_filter","default_value":"B%","explore":null,"dimension":null,"row":1,"allow_multiple_values":true,"required":false,"ui_config":null,"model":null,"listens_to_filters":[],"field":null,"can":{"create":true,"update":true,"destroy":true,"index":true,"show":true,"show_errors":true,"find_and_replace":true}},{"id":10,"dashboard_id":2,"name":"Test Filter","title":"Test Filter","type":"string_filter","default_value":"C","explore":null,"dimension":null,"row":2,"allow_multiple_values":true,"required":false,"ui_config":null,"model":null,"listens_to_filters":[],"field":null,"can":{"create":true,"update":true,"destroy":true,"index":true,"show":true,"show_errors":true,"find_and_replace":true}}],"dashboard_layouts":[{"id":2,"dashboard_id":2,"type":"newspaper","active":true,"column_width":null,"width":null,"deleted":false,"dashboard_title":"Brands","dashboard_layout_components":[{"id":2,"dashboard_layout_id":2,"dashboard_element_id":2,"row":0,"column":0,"width":24,"height":8,"deleted":false,"element_title":"Brand Product Count","element_title_hidden":false,"vis_type":"looker_column","can":{"index":true,"show":true,"create":true,"update":true,"destroy":true}},{"id":3,"dashboard_layout_id":2,"dashboard_element_id":3,"row":8,"column":0,"width":24,"height":8,"deleted":false,"element_title":"New Tile","element_title_hidden":false,"vis_type":"looker_scatter","can":{"index":true,"show":true,"create":true,"update":true,"destroy":true}}],"can":{"create":true,"update":true,"destroy":true,"index":true,"show":true}}],"deleted_at":null,"deleter_id":null,"edit_uri":null,"favorite_count":0,"last_accessed_at":"2019-09-25T07:07:45.988-07:00","load_configuration":"cache_run","lookml_link_id":null,"show_filters_bar":true,"show_title":true,"slug":"yt36BUNqEjZ2ibSCmT3kCT","space_id":5,"text_tile_text_color":null,"tile_background_color":null,"tile_text_color":null,"title_color":null,"view_count":336,"folder":{"child_count":0,"content_metadata_id":5,"creator_id":1,"external_id":null,"id":5,"is_embed":false,"is_embed_shared_root":false,"is_embed_users_root":false,"is_personal":true,"is_personal_descendant":false,"is_shared_root":false,"is_users_root":false,"name":"John Kaster","parent_id":2,"can":{"index":true,"show":true,"create":true,"see_admin_spaces":true,"update":false,"destroy":false,"move_content":true,"edit_content":true}},"folder_id":5,"content_favorite_id":null,"model":null,"deleted":false,"last_viewed_at":"2019-09-25T07:07:46.130-07:00","settings":null,"can":{"download":true,"index":true,"show":true,"copy":true,"run":true,"create":true,"move":true,"update":true,"destroy":true,"recover":true,"see_lookml":true,"schedule":true,"render":true}}
"""#

@available(OSX 10.12, *)
class modelsTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testUser() {
        do {
            let user : User = try deserialize(jsonUser)
            XCTAssertNotNil(user)
        } catch {
            // Trying to figure out what's causing the deserialization error
            print(error)
            XCTAssertNil(error)
        }
    }

    func deserialize<T>(_ data: Data) throws -> T where T : Codable {
        let decoder = JSONDecoder()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
        formatter.calendar = Calendar(identifier: .iso8601)
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.locale = Foundation.Locale(identifier: "en_US_POSIX")
        decoder.dateDecodingStrategy = .formatted(formatter)
        do {
            let result: T = try decoder.decode(T.self, from: data)
            return result
        } catch {
            throw error
        }
        
    }
    /// Convert a JSON string into the type `T`
    /// @throws errors if deserialization fails
    func deserialize<T>(_ json: String) throws -> T where T : Codable {
        return try deserialize(Data(json.utf8))
    }

    func testDateParse() {
        let value = "2018-03-15T13:16:34.692-07:00"
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
        formatter.calendar = Calendar(identifier: .iso8601)
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.locale = Foundation.Locale(identifier: "en_US_POSIX")
        let date = formatter.date(from: value)

        XCTAssertNotNil(date)
        let dateString = formatter.string(from: date!)
        print(dateString)
        XCTAssertNotNil(dateString)
    }
    
    let json = #"""
    {
    "want_string": 4,
    "want_int": "5",
    "want_dub": 2.3,
    "not_a_date":"2018-03-15T13:16:34.692-07:00",
    "nullable": null,
    "is_bool": true
    }
    """#

    struct Hacky : Codable {
        var want_string: Variant
        var want_int: Variant?
        var want_dub: Variant?
        var not_a_date: Variant?
        var is_bool: Variant?
        var nullable: Variant?
    }
        
    struct Simple : Codable {
        var want_string: String?
        var want_int: Int?
        var want_dub: Double?
        var not_a_date: String?
        var is_bool: Bool?
        var uri: URI?
    }
    
    // TODO figure out how to coerce String types to String with sloppy JSON
    // Parsing String as Date Swift bug https://bugs.swift.org/browse/SR-7461
    func testJsonHackyString() {
        do {
            let item : Hacky = try deserialize(#"{"want_string":4}"#)
            XCTAssertNotNil(item)
            XCTAssertEqual(item.want_string.getString(), "4", "Expected '4'")
            XCTAssertNil(item.want_int)
            XCTAssertNil(item.want_dub)
            XCTAssertNil(item.not_a_date)
            XCTAssertNil(item.is_bool)
            XCTAssertNil(item.nullable)
        } catch {
            print(error)
            XCTAssertNil(error)
        }
    }

    func testJsonUri() {
        do {
            var item : Simple = try deserialize(#"{"uri":"/projects/cucu_thelook_1552930443_project/files/business_pulse.dashboard.lookml?line=1"}"#)
            print("strict passed")
            XCTAssertNotNil(item)
            XCTAssertEqual(item.uri!, "/projects/cucu_thelook_1552930443_project/files/business_pulse.dashboard.lookml?line=1")
            item = try deserialize(#"{"uri":null}"#)
            print("strict null passed")
            XCTAssertNotNil(item)
            XCTAssertNil(item.want_string, "uri should be nil")
        } catch {
            print(error)
            XCTAssertNil(error)
        }

    }
    
    func testJsonSimpleString() {
        
        do {
            var item : Simple = try deserialize(#"{"want_string":"4"}"#)
            print("strict passed")
            XCTAssertNotNil(item)
            XCTAssertEqual(item.want_string, "4")
            item = try deserialize(#"{"want_string":null}"#)
            print("strict null passed")
            XCTAssertNotNil(item)
            XCTAssertNil(item.want_string, "want_string should be nil")
//            item = try deserialize(#"{"want_string":4}"#)
//            print("lazy passed")
//            XCTAssertNotNil(item)
//            XCTAssertEqual(item.want_string, "4")

        } catch {
            print(error)
            XCTAssertNil(error)
        }
    }

    func testJsonSimpleInt() {
        
        do {
            var item : Simple = try deserialize(#"{"want_int":4}"#)
            print("strict passed")
            XCTAssertNotNil(item)
            XCTAssertEqual(item.want_int, 4)
            item = try deserialize(#"{"want_int":null}"#)
            print("null passed")
            XCTAssertNotNil(item)
            XCTAssertNil(item.want_int)
        } catch {
            print(error)
            XCTAssertNil(error)
        }
    }

    func testDashboard() {
        do {
            let dash : Dashboard = try deserialize(jsonDashboard2)
            XCTAssertNotNil(dash)
        } catch {
            // Trying to figure out what's causing the deserialization error
            print(error)
            XCTAssertNil(error)
        }
    }
}
