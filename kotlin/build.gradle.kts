group = "com.looker.sdk"
defaultTasks = mutableListOf("jar")

val kotlinVersion = providers.gradleProperty("kotlinVersion").get()
val googleHttpVersion = providers.gradleProperty("googleHttpVersion").get()

plugins {
    kotlin("jvm")
    id("com.diffplug.spotless")
}

sourceSets {
    main {
        kotlin {
            setSrcDirs(listOf("src/main/"))
        }
    }
    test {
        kotlin {
            setSrcDirs(listOf("src/test"))
        }
    }
}

repositories {
    mavenCentral()
    maven { url = uri("https://dl.bintray.com/kotlin/ktor") }
    maven { url = uri("https://dl.bintray.com/kotlin/kotlinx") }
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-reflect:$kotlinVersion")

    implementation("io.github.cdimascio:dotenv-kotlin:6.2.2")
    implementation("org.ini4j:ini4j:0.5.4")

    implementation("commons-configuration:commons-configuration:1.10")

    implementation(platform("com.google.http-client:google-http-client-bom:$googleHttpVersion"))
    implementation("com.google.http-client:google-http-client")
    implementation("com.google.http-client:google-http-client-apache-v2")
    implementation("com.google.http-client:google-http-client-gson")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
    implementation("com.google.code.gson:gson:2.8.5")

    testImplementation("org.junit.jupiter:junit-jupiter-api:5.3.1")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.3.1")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlinVersion")
}

spotless {
    kotlin {
        ktlint("0.50.0").setEditorConfigPath("$projectDir/../.editorconfig")
    }
}

kotlin {
    jvmToolchain(17)
}

tasks.test {
    testLogging {
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
