import express from "express";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// route.js যেহেতু server/ এ আছে, আর v1 ও server/ এ আছে — তাই সরাসরি __dirname
const versionsPath = __dirname;

const versions = readdirSync(versionsPath).filter((f) => /^v\d+$/.test(f));
console.log("📂 Found versions:", versions);

for (const version of versions) {
  const modulesPath = join(versionsPath, version, "modules");

  let modules;
  try {
    modules = readdirSync(modulesPath);
  } catch (err) {
    console.log(`⚠️  No modules folder in ${version}`);
    continue;
  }

  for (const mod of modules) {
    const routeFile = join(modulesPath, mod, "route", "index.js");

    try {
      const { default: moduleRouter } = await import(
        pathToFileURL(routeFile).href
      );
      router.use(`/api/${version}/${mod}`, moduleRouter);
      console.log(`✅ Loaded: /api/${version}/${mod}`);
    } catch (err) {
      console.log(`❌ Failed to load ${mod}:`, err.message);
    }
  }
}

export default router;
