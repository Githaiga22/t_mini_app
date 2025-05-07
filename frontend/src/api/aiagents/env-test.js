// env-test.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get directory path for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to find the .env file
const rootDir = path.resolve(__dirname, '../../..');
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(rootDir, '.env'),
  path.join(__dirname, '.env')
];

console.log("Searching for .env file in:");
envPaths.forEach((envPath, index) => {
  const exists = fs.existsSync(envPath);
  console.log(`${index + 1}. ${envPath} - ${exists ? '✓ Found' : '✗ Not found'}`);
});

// Load environment with explicit path
console.log("\nTrying to load .env from root directory:");
const result = dotenv.config({ path: path.join(rootDir, '.env') });
if (result.error) {
  console.log(`✗ Error loading .env: ${result.error.message}`);
} else {
  console.log("✓ .env loaded successfully");
}

// Check env variables
console.log("\nEnvironment variable status:");
console.log("- RPC_URL:", process.env.RPC_URL ? `✓ Set: ${process.env.RPC_URL}` : "✗ Not set");
console.log("- PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✓ Set (hidden for security)" : "✗ Not set");

// Test environment in your app config
console.log("\nEnvironment context check:");
console.log("- process.cwd():", process.cwd());
console.log("- __dirname:", __dirname);
console.log("- Resolved root:", rootDir);
