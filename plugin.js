const directive = /^oxlint-(?:disable(?:-next-line|-line)?|enable)(?:\s|$)/;
const expectError = /^@ts-expect-error(?:\W|$)/;

const isReadByTools = (comment         )          => {
  if (comment.type === "Shebang") return true;
  const text = comment.value.trim();
  return directive.test(text) || expectError.test(text);
};

const noComments       = {
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

const plugin         = {
  meta: { name: "ways-of-working" },
  rules: { "no-comments": noComments },
};

export default plugin;
