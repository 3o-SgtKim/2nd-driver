const fs = require('fs');
const path = require('path');

const androidDir = path.join(__dirname, '..', 'android');
if (!fs.existsSync(androidDir)) {
  console.log('[fix-android] No android/ dir — skipping.');
  process.exit(0);
}

// local.properties — SDK path
const localProps = path.join(androidDir, 'local.properties');
const sdkDir = process.env.ANDROID_HOME || 'C:\\Users\\root\\AppData\\Local\\Android\\Sdk';
fs.writeFileSync(localProps, `sdk.dir=${sdkDir.replace(/\\/g, '\\\\')}\n`);
console.log('[fix-android] local.properties OK');

// gradle.properties — ensure JDK 17
const gradleProps = path.join(androidDir, 'gradle.properties');
if (fs.existsSync(gradleProps)) {
  let content = fs.readFileSync(gradleProps, 'utf8');
  if (!content.includes('org.gradle.java.home')) {
    const javaHome = process.env.JAVA_HOME || 'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.101-hotspot';
    content += `\norg.gradle.java.home=${javaHome.replace(/\\/g, '\\\\')}\n`;
    fs.writeFileSync(gradleProps, content);
    console.log('[fix-android] gradle.properties patched with JDK 17');
  } else {
    console.log('[fix-android] gradle.properties already has java.home');
  }
}

// Debug builds get a different package so they can sit next to the release APK.
const appGradle = path.join(androidDir, 'app', 'build.gradle');
if (fs.existsSync(appGradle)) {
  let gradle = fs.readFileSync(appGradle, 'utf8');
  if (!gradle.includes('applicationIdSuffix')) {
    gradle = gradle.replace(
      /debug \{\s*\n\s*signingConfig signingConfigs.debug/,
      'debug {\n            applicationIdSuffix ".debug"\n            signingConfig signingConfigs.debug'
    );
    fs.writeFileSync(appGradle, gradle);
    console.log('[fix-android] debug applicationIdSuffix .debug');
  }
}

const debugStringsDir = path.join(androidDir, 'app', 'src', 'debug', 'res', 'values');
const debugStrings = path.join(debugStringsDir, 'strings.xml');
if (!fs.existsSync(debugStrings)) {
  fs.mkdirSync(debugStringsDir, { recursive: true });
  fs.writeFileSync(
    debugStrings,
    '<resources>\n  <string name="app_name">2nd Driver Dev</string>\n</resources>\n'
  );
  console.log('[fix-android] debug app name set to 2nd Driver Dev');
}
