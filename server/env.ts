import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env from project root. Works for: tsx server/index.ts (__dirname = server) and node dist/index.js (__dirname = dist).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");
let result = dotenv.config({ path: envPath, override: false });
if (!result.parsed || Object.keys(result.parsed).length === 0) {
  const cwdPath = path.join(process.cwd(), ".env");
  if (cwdPath !== envPath) {
    result = dotenv.config({ path: cwdPath, override: false });
  }
}
