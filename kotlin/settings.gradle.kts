rootProject.name = "looker-kotlin-sdk"

pluginManagement {
    val kotlinVersion = providers.gradleProperty("kotlinVersion").get()
    plugins {
        kotlin("jvm") version kotlinVersion
        id("com.diffplug.spotless") version "6.20.0"
    }
}
