rootProject.name = "looker-kotlin-sdk"

pluginManagement {
    val kotlinVersion = providers.gradleProperty("kotlinVersion").get()
    plugins {
        kotlin("jvm") version kotlinVersion
        id("com.diffplug.spotless") version "6.20.0"
        id("org.gradle.toolchains.foojay-resolver-convention") version "0.7.0"
        id("com.github.johnrengelman.shadow") version "8.1.1"
    }
}
