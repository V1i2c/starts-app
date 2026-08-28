// Applies the Android-native customisation this app actually needs on top of
// the pristine project `npx cap add android` generates. Run once per CI build,
// right after `cap add android` and before Gradle. Kept as a small, readable
// script instead of committing a whole hand-authored android/ project, so the
// native project is always regenerated from the currently-installed Capacitor
// version (no drift, no stale Gradle files nobody remembers to update).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const androidDir = join(root, "android");

if (!existsSync(androidDir)) {
  console.error("android/ not found — run `npx cap add android` before this script.");
  process.exit(1);
}

const PACKAGE_PATH = "com/starts/artstudent";
const javaDir = join(androidDir, "app", "src", "main", "java", ...PACKAGE_PATH.split("/"));
mkdirSync(javaDir, { recursive: true });
copyFileSync(join(root, "android-native", "MainActivity.java"), join(javaDir, "MainActivity.java"));
console.log(`✔ MainActivity.java (getUserMedia permission bridge) installed at ${javaDir}`);

const manifestPath = join(androidDir, "app", "src", "main", "AndroidManifest.xml");
let manifest = readFileSync(manifestPath, "utf8");

// Only the permissions this app genuinely uses. Deliberately no INTERNET
// permission: every asset is bundled, nothing here talks to a network.
const PERMISSIONS = [
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
  '<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />',
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
];
const FEATURES = [
  '<uses-feature android:name="android.hardware.camera" android:required="false" />',
  '<uses-feature android:name="android.hardware.microphone" android:required="false" />',
];

const toInsert = [...PERMISSIONS, ...FEATURES].filter((line) => !manifest.includes(line));

if (toInsert.length > 0) {
  manifest = manifest.replace(
    /(<manifest[^>]*>)/,
    `$1\n    ${toInsert.join("\n    ")}`,
  );
  writeFileSync(manifestPath, manifest, "utf8");
  console.log(`✔ AndroidManifest.xml patched with ${toInsert.length} new permission/feature entries`);
} else {
  console.log("✔ AndroidManifest.xml already up to date");
}
