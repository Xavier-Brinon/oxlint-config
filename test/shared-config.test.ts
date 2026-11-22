import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const sharedConfig = fileURLToPath(new URL("../oxlintrc.json", import.meta.url));
const oxlint = fileURLToPath(new URL("../node_modules/.bin/oxlint", import.meta.url));

const lintInConsumer = async (fileName: string, code: string) => {
  const consumer = await mkdtemp(join(tmpdir(), "oxlint-config-consumer-"));
  try {
    await writeFile(join(consumer, ".oxlintrc.json"), JSON.stringify({ extends: [sharedConfig] }));
    await writeFile(join(consumer, fileName), code);
    return spawnSync(oxlint, [], { cwd: consumer, encoding: "utf8" });
  } finally {
    await rm(consumer, { recursive: true });
  }
};

test("a repo extending the shared config fails on a comment", async () => {
  const run = await lintInConsumer("commented.tsx", "export const view = <div>{/* x */}</div>;\n");
  assert.equal(run.status, 1);
  assert.match(run.stdout, /ways-of-working\(no-comments\)/);
});

test("a repo extending the shared config fails on a directive with no reason", async () => {
  const run = await lintInConsumer(
    "silenced.ts",
    "// oxlint-disable-next-line no-console\nconsole.log(1);\n",
  );
  assert.equal(run.status, 1);
  assert.match(run.stdout, /ways-of-working\(require-disable-description\)/);
  assert.doesNotMatch(run.stdout, /ways-of-working\(no-comments\)/);
});

test("a repo extending the shared config passes on a directive with a reason", async () => {
  const run = await lintInConsumer(
    "silenced.ts",
    "// oxlint-disable-next-line no-console -- this file is a script\nconsole.log(1);\n",
  );
  assert.equal(run.status, 0, run.stdout);
});

test("a repo extending the shared config passes without comments", async () => {
  const run = await lintInConsumer("clean.ts", "export const answer = 42;\n");
  assert.equal(run.status, 0, run.stdout);
});
