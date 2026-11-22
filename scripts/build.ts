import { readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";

const source = new URL("../plugin.ts", import.meta.url);

export const shipped = new URL("../plugin.js", import.meta.url);

export const renderPlugin = async (): Promise<string> =>
  stripTypeScriptTypes(await readFile(source, "utf8"))
    .replace(/[ \t]+$/gm, "")
    .trimStart();

if (import.meta.main) {
  await writeFile(shipped, await renderPlugin());
}
