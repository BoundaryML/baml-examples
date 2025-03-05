/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// import { compileMDX, type CompileMDXResult } from "next-mdx-remote/rsc";


// import rehypeSlug from "rehype-slug";
// import rehypeAutolinkHeadings from "rehype-autolink-headings";
// // @ts-expect-error no types
// import remarkA11yEmoji from "@fec/remark-a11y-emoji";
// import remarkToc from "remark-toc";
import rehypeStringify from "rehype-stringify";

import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
// import rehypePrettyCode, {
//   type Options as RehypePrettyCodeOption,
// } from "rehype-pretty-code";
import { Fragment, useEffect, useState } from "react";
// import rehypeShiki, { RehypeShikiOptions } from "@shikijs/rehype";
import { RehypeShikiCoreOptions } from "@shikijs/rehype/core";
// import { LanguageInput } from "shiki";
import { ErrorBoundary } from "react-error-boundary";
import { bamlJinjaTextmate, bamlTextmate } from "./shiki-grammars";
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className='p-4 text-red-500'>
      <p>Something went wrong rendering the markdown:</p>
      <pre className='mt-2 text-sm'>{error.message}</pre>
    </div>
  )
}
// import rehypePrettyCode from "rehype-pretty-code";

export function MarkdownRenderer({ source }: { source: string }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MarkdownContent source={source} />
    </ErrorBoundary>
  )
}

function MarkdownContent({ source }: { source: string }) {
  console.log(source)
  //   source = `
  //   # header
  // \`\`\`baml
  // enum Color {
  //   Red
  //   Green
  //   Blue
  // }

  // class Resume {
  //   name string
  //   age int
  // }

  // function Hi(query: string) -> string {

  // }
  // \`\`\`

  //   \`\`\`baml-jinja
  //   {% if name %}
  //     Hi {{ name }}
  //   {% endif %}
  //   \`\`\`

  //   ## text
  //   \`\`\`python
  //   def hello():
  //     print("hello")
  //   \`\`\`
  //   `;
  const [mdxModule, setMdxModule] = useState<any | undefined>(undefined);
  const [error, setError] = useState<boolean>(false);
  const Content = mdxModule ? mdxModule.default : Fragment;
  const [highlighter, setHighlighter] = useState<any | undefined>(undefined);

  useEffect(() => {
    if (highlighter) return;
    (async () => {
      try {
        const { createHighlighterCore } = await import("shiki/core");
        const highlighter = await createHighlighterCore({
          themes: [import("shiki/themes/github-dark-default.mjs")],
          langs: [
            bamlJinjaTextmate,
            bamlTextmate,
            import("shiki/langs/python.mjs"),
            import("shiki/langs/typescript.mjs"),
            import("shiki/langs/ruby.mjs"),
          ],
          engine: createJavaScriptRegexEngine(),
          // loadWasm: import("shiki/wasm"),
        });
        setHighlighter(highlighter);
      } catch (error) {
        console.error("Error creating highlighter:", error);
        setError(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!highlighter) return;

    (async () => {
      try {
        const rehypeShikiFromHighlighter = (
          await import("@shikijs/rehype/core")
        ).default;

        const code = await compile(source, {
          outputFormat: "function-body",
          // remarkPlugins: [remarkParse],
          rehypePlugins: [
            [
              rehypeShikiFromHighlighter,
              highlighter,
              {
                themes: {
                  light: "github-dark-default",
                  dark: "github-dark-default",
                },
              } satisfies RehypeShikiCoreOptions,
            ],
            [rehypeStringify as () => void, { allowDangerousHtml: true }],
          ],
        });
        const compiledModule = await run(code, { ...runtime });
        setMdxModule(compiledModule);
        setError(false);
      } catch (error) {
        console.error("Error compiling MDX:", error);
        setError(true);
      }
    })();
  }, [source, highlighter]);

  if (error) {
    return <div className="prose-md whitespace-pre-wrap">{source}</div>;
  }

  return (
    <pre className="prose whitespace-pre-wrap">
      <Content />
    </pre>
  );
}
