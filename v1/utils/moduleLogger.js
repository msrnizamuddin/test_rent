// utils/moduleLogger.js
import { fileURLToPath } from "url";
import path from "path";

export function logModule(importMetaUrl) {
  const filename = fileURLToPath(importMetaUrl);
  const relative = path.relative(process.cwd(), filename);

  // console.log(`🔵 moduleFileLoaded: ${relative}`);
}
