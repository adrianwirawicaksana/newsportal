const fs = require("fs");
const { spawnSync } = require("child_process");
const envPath = "./.env";
const envText = fs.readFileSync(envPath, "utf8");
const lines = envText.split(/\r?\n/);
let failed = [];
for (const line of lines) {
  if (!line || line.trim().startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx === -1) continue;
  const name = line.slice(0, idx).trim();
  const value = line.slice(idx + 1);
  if (!name) continue;
  console.log(`Updating ${name}`);
  const proc = spawnSync(
    `vercel env add ${name} production --force --sensitive`,
    {
      shell: true,
      encoding: "utf8",
      input: value + "\n",
    },
  );
  process.stdout.write(proc.stdout || "");
  process.stderr.write(proc.stderr || "");
  if (proc.status !== 0) {
    failed.push({ name, status: proc.status, signal: proc.signal });
  }
}
if (failed.length) {
  console.error(
    "Failed to update variables:",
    failed.map((x) => x.name).join(", "),
  );
  process.exit(1);
}
console.log("All variables updated.");
