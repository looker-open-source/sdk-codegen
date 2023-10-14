package com.looker.rtl

import com.google.api.client.util.ObjectParser
import com.google.gson.Gson
import com.google.gson.stream.JsonReader
import java.io.InputStream
import java.io.InputStreamReader
import java.io.Reader
import java.lang.reflect.Type
import java.nio.charset.Charset
import java.util.HashMap

/** Custom GSON based parser for deserialization. */
class GsonObjectParser : ObjectParser {
    override fun <T : Any?> parseAndClose(
        inputStream: InputStream?,
        charset: Charset?,
        clazz: Class<T>?,
    ): T {
        return doParseAndClose(InputStreamReader(inputStream, charset), clazz)
    }

    override fun parseAndClose(inputStream: InputStream?, charset: Charset?, type: Type?): Any {
        return doParseAndClose(InputStreamReader(inputStream, charset), type)
    }

    override fun <T : Any?> parseAndClose(reader: Reader?, clazz: Class<T>?): T {
        return doParseAndClose(reader, clazz)
    }

    override fun parseAndClose(reader: Reader?, type: Type?): Any {
        return doParseAndClose(reader, type)
    }

    private fun <T : Any?> doParseAndClose(reader: Reader?, type: Type?): T {
        val jsonReader = JsonReader(reader)
        jsonReader.use {
            return GSON.fromJson(reader, type)
        }
    }

    companion object {
        /** [Gson] instance used for serializing Kotlin data classes and deserializing responses */
        val GSON: Gson = Gson().newBuilder()
            .registerTypeAdapter(AuthToken::class.java, AuthTokenAdapter())
            .create()
    }
}
