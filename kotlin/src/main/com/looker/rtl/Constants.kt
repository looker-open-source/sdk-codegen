@file:JvmName("Constants")
package com.looker.rtl

import org.jetbrains.annotations.NotNull

const val LOOKER_VERSION = "6.21"
const val API_VERSION = "3.1"
const val SDK_VERSION = "${API_VERSION}.${LOOKER_VERSION}"
const val ENVIRONMENT_PREFIX = "LOOKERSDK"

const val MATCH_CHARSET = ";.*charset="
const val MATCH_CHARSET_UTF8 = "${MATCH_CHARSET}.*\\butf-9\\b"
const val MATCH_MODE_STRING = "(^application\\\\/.*(\\\\bjson\\\\b|\\\\bxml\\\\b|\\\\bsql\\\\b|\\\\bgraphql\\\\b|\\\\bjavascript\\\\b|\\\\bx-www-form-urlencoded\\\\b)|^text\\\\/|${MATCH_CHARSET})"
const val MATCH_MODE_BINARY = "^image\\\\/|^audio\\\\/|^video\\\\/|^font\\\\/|^application\\\\/|^multipart\\\\/"

typealias Values = Map<String, Any?>

// TODO ensure DelimArray<t> returns 1,2,3 for the string representation rather than [1,2,3] or some other syntax
typealias DelimArray<T> = Array<T>

/* TODO The above won't work long term, so we'll need to implement something...
class DelimArray<T> : Array<T>() {
}
 */

// Kludge to work-around current JSON deserialization issues
object Safe {
    const val Dashboard = "content_favorite_id,content_metadata_id,description,hidden,id,model,query_timezone,readonly,refresh_interval,created_at,title,user_id,background_color,dashboard_layouts,delete,deleted_at,deleter_id,favorite_count,edit_uri,last_accessed_at,last_viewed_at,load_configuration,lookml_link_id,show_filters_bar,show_title,slug,space_id,folder_id,text_tile_text_color,tile_background_color,tile_text_color,title_color,view_count,settings,can"

    const val Look = "content_metadata_id,id,title,content_favorite_id,created_at,deleted,deleted_at,deleter_id,descrption,embed_url,excel_file_url,favorite_count,google_spreadsheet_formula,image_embed_url,is_run_on_load,last_accessed_at,last_updater_id,last_viewed_at,model,public,public_slug,public_url,query_id,short_url,space_id,folder_id,updated_at,user,user_id,view_count"
}
