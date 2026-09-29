const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or'];

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enPath = path.join(localesDir, 'en.json');
if (!fs.existsSync(enPath)) {
  console.error("ERROR: en.json does not exist in src/locales/");
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = new Set(getKeys(enData));

console.log(`[i18n-check] Ground truth en.json has ${enKeys.size} total keys.`);

let hasError = false;

for (const lang of languages) {
  const file = path.join(localesDir, `${lang}.json`);
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing locale file: ${lang}.json`);
    hasError = true;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const langKeys = new Set(getKeys(data));
  const missing = [];

  for (const k of enKeys) {
    if (!langKeys.has(k)) {
      missing.push(k);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ ${lang}.json is missing ${missing.length} keys:`, missing.slice(0, 5));
    hasError = true;
  } else {
    console.log(`✓ ${lang}.json: 100% key parity (${langKeys.size}/${enKeys.size})`);
  }
}

if (hasError) {
  console.error("\n❌ i18n coverage check FAILED: Some locale files are missing required keys.");
  process.exit(1);
} else {
  console.log("\n✅ All 11 languages have 100% key parity with en.json!");
  process.exit(0);
}
