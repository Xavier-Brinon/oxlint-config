import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";
import plugin from "../plugin.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const inTsAndTsx = (code: string) => [
  { code, filename: "sample.ts" },
  { code, filename: "sample.tsx" },
];

const fails = (code: string, lines: number[]) =>
  inTsAndTsx(code).map((testCase) => ({
    ...testCase,
    errors: lines.map((line) => ({ messageId: "noComment", line })),
  }));

const tsxOnly = (code: string) => ({ code, filename: "sample.tsx" });

new RuleTester().run("no-comments", plugin.rules["no-comments"], {
  valid: [
    ...inTsAndTsx("const answer: number = 42;\nexport default answer;"),
    ...inTsAndTsx("const unused = 1; // oxlint-disable-line no-unused-vars"),
    ...inTsAndTsx("// oxlint-disable-next-line no-unused-vars\nconst unused = 1;"),
    ...inTsAndTsx("/* oxlint-disable no-unused-vars */\nconst unused = 1;"),
    ...inTsAndTsx(
      "/* oxlint-disable no-console */\nconsole.log(1);\n/* oxlint-enable no-console */",
    ),
    ...inTsAndTsx('// @ts-expect-error\nconst wrong: number = "text";\nexport default wrong;'),
    ...inTsAndTsx("#!/usr/bin/env node\nconsole.log(1);"),
    tsxOnly("export const view = <div>{1}</div>;"),
    tsxOnly(
      "export const view = (\n  <div>\n    {/* @ts-expect-error */}\n    <Missing />\n  </div>\n);",
    ),
  ],
  invalid: [
    ...fails("// a line comment\nexport const answer = 42;", [1]),
    ...fails("export const answer = 42; /* a block comment */", [1]),
    ...fails("/** A JSDoc comment. */\nexport function noop() {}", [1]),
    ...fails("// first\nexport const answer = 42;\n/* second */", [1, 3]),
    ...fails("#!/usr/bin/env node\n// after the shebang\nconsole.log(1);", [2]),
    ...fails('// @ts-ignore\nconst wrong: number = "text";\nexport default wrong;', [1]),
    ...fails("// eslint-disable-next-line no-console\nconsole.log(1);", [1]),
    ...fails("// oxlint-disabled is not a directive\nexport const answer = 42;", [1]),
    ...fails("/** oxlint-disable no-console */\nconsole.log(1);", [1]),
    { ...tsxOnly("export const view = <div>{/* x */}</div>;"), errors: [{ messageId: "noComment", line: 1 }] },
  ],
});
