import { describe, it } from "node:test";
import { RuleTester } from "oxlint/plugins-dev";
import plugin from "../plugin.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const inTsAndTsx = (code: string) => [
  { code, filename: "sample.ts" },
  { code, filename: "sample.tsx" },
];

const fails = (code: string, line: number) =>
  inTsAndTsx(code).map((testCase) => ({
    ...testCase,
    errors: [{ messageId: "noReason", line }],
  }));

new RuleTester().run("require-disable-description", plugin.rules["require-disable-description"], {
  valid: [
    ...inTsAndTsx("export const answer = 42;"),
    ...inTsAndTsx("const unused = 1; // oxlint-disable-line no-unused-vars -- kept for the example"),
    ...inTsAndTsx(
      "// oxlint-disable-next-line no-unused-vars -- kept for the example\nconst unused = 1;",
    ),
    ...inTsAndTsx("/* oxlint-disable no-console -- this file is a script */\nconsole.log(1);"),
    ...inTsAndTsx(
      "/* oxlint-disable no-console -- a script */\nconsole.log(1);\n/* oxlint-enable no-console */",
    ),
    ...inTsAndTsx('// @ts-expect-error\nconst wrong: number = "text";\nexport default wrong;'),
    ...inTsAndTsx("// an ordinary comment\nexport const answer = 42;"),
  ],
  invalid: [
    ...fails("const unused = 1; // oxlint-disable-line no-unused-vars", 1),
    ...fails("// oxlint-disable-next-line no-unused-vars\nconst unused = 1;", 1),
    ...fails("/* oxlint-disable no-console */\nconsole.log(1);", 1),
    ...fails("/* oxlint-disable-next-line no-console */\nconsole.log(1);", 1),
    ...fails("// oxlint-disable-next-line no-unused-vars --\nconst unused = 1;", 1),
    ...fails("// oxlint-disable-next-line no-unused-vars --   \nconst unused = 1;", 1),
    ...fails("export const answer = 42;\n// oxlint-disable-next-line no-console\nconsole.log(1);", 2),
  ],
});
