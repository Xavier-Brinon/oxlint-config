import type { Plugin, Rule } from "@oxlint/plugins";

const noComments: Rule = {
  meta: {
    type: "problem",
    messages: {
      noComment:
        "Comments are not allowed: names and structure say what the code does, the commit message says why.",
    },
    schema: [],
  },
  create() {
    return {};
  },
};

const plugin: Plugin = {
  meta: { name: "ways-of-working" },
  rules: { "no-comments": noComments },
};

export default plugin;
