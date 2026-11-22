import type { Comment, Plugin, Rule } from "@oxlint/plugins";

const directive = /^oxlint-(?:disable(?:-next-line|-line)?|enable)(?:\s|$)/;
const expectError = /^@ts-expect-error(?:\W|$)/;

const isReadByTools = (comment: Comment): boolean => {
  if (comment.type === "Shebang") return true;
  const text = comment.value.trim();
  return directive.test(text) || expectError.test(text);
};

const noComments: Rule = {
  meta: {
    type: "problem",
    messages: {
      noComment:
        "Comments are not allowed: names and structure say what the code does, the commit message says why.",
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (!isReadByTools(comment)) {
            context.report({ messageId: "noComment", loc: comment.loc });
          }
        }
      },
    };
  },
};

const requireDisableDescription: Rule = {
  meta: {
    type: "problem",
    messages: {
      noReason: "A disable directive says why: add the reason after \" -- \" on the directive.",
    },
    schema: [],
  },
  create() {
    return {};
  },
};

const plugin: Plugin = {
  meta: { name: "ways-of-working" },
  rules: {
    "no-comments": noComments,
    "require-disable-description": requireDisableDescription,
  },
};

export default plugin;
