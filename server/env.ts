import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env from project root. Try .env first, then .env.example so keys are found.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const cwdRoot = process.cwd();

// Prefer project root (where package.json and .env live) so we don't depend on cwd
const rootEnv = path.join(projectRoot, ".env");
const rootEnvExample = path.join(projectRoot, ".env.example");
const cwdEnv = path.join(cwdRoot, ".env");
const cwdEnvExample = path.join(cwdRoot, ".env.example");

// Load .env from project root first, then cwd, so Razorpay keys are always found
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv, override: true });
}
if (fs.existsSync(cwdEnv) && cwdEnv !== rootEnv) {
  dotenv.config({ path: cwdEnv, override: true });
}
if (fs.existsSync(rootEnvExample)) {
  dotenv.config({ path: rootEnvExample, override: false });
}
if (fs.existsSync(cwdEnvExample) && cwdEnvExample !== rootEnvExample) {
  dotenv.config({ path: cwdEnvExample, override: false });
}

