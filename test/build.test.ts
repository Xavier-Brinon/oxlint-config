import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { renderPlugin, shipped } from "../scripts/build.ts";

test("plugin.js is plugin.ts with its types stripped", async () => {
  assert.equal(await readFile(shipped, "utf8"), await renderPlugin());
});
