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
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    constraints {
        implementation("com.google.guava:guava:33.7.2-jre") {
            because("Fixes Dependabot alert #560 in Guava < 33.7.2")
        }
    }

    implementation("org.jetbrains.kotlin:kotlin-reflect:$kotlinVersion")

    implementation("io.github.cdimascio:dotenv-kotlin:6.2.2")
    implementation("com.google.auth:google-auth-library-oauth2-http:1.56.0")
    implementation(platform("com.google.http-client:google-http-client-bom:$googleHttpVersion"))
    implementation("com.google.http-client:google-http-client")
    implementation("com.google.http-client:google-http-client-apache-v2")
    implementation("com.google.http-client:google-http-client-gson")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    implementation("com.google.code.gson:gson:2.14.0")

    testImplementation("org.junit.jupiter:junit-jupiter-api:5.3.1")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.3.1")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlinVersion")
}

spotless {
    kotlin {
        ktlint("1.0.1").setEditorConfigPath("$projectDir/../.editorconfig")
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
