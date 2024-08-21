import React, { useRef, type PropsWithChildren } from "react";

import { StreamLanguage } from "@codemirror/language";

import { BAML, theme } from "@boundaryml/baml-lezer";
import CodeMirror, {
  Compartment,
  EditorView,
  Extension,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import {
  type Diagnostic,
  forceLinting,
  linter,
  openLintPanel,
} from "@codemirror/lint";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { atomStore, diagnosticsAtom, filesAtom } from "./atoms";

interface SnippetProps {
  language: "ts" | "py" | "baml" | "rb";
  source: string;
  className?: string;
  animate?: boolean;
  duration?: number;
}

export const Snippet: React.FC<SnippetProps> = ({
  language,
  source,
  animate = true,
  duration = 200,
}) => {
  const [displayedSource, setDisplayedSource] = useState<string>("");

  return (
    <div className="min-h-[305px]">
      <CodeMirrorViewer lang={language} fileContent={displayedSource} />
    </div>
  );
};

function makeLinter() {
  return linter(
    (_view) => {
      console.log("running linter");
      const diagnosticErrors = atomStore.get(diagnosticsAtom);
      // const currentFile = atomStore.get(activeFileNameAtom);
      // if (!currentFile) {
      //   return [];
      // }

      console.log("diagnosticErrors", diagnosticErrors);

      return (
        diagnosticErrors.map((err): Diagnostic => {
          return {
            from: err.start_ch,
            to: err.start_ch === err.end_ch ? err.end_ch + 1 : err.end_ch,
            message: err.message,
            severity: err.type === "warning" ? "warning" : "error",
            source: "baml",
            markClass:
              err.type === "error"
                ? "decoration-wavy decoration-red-500 text-red-450 stroke-blue-500"
                : "",
          };
        }) ?? []
      );
    },
    { delay: 200 }
  );
}

const comparment = new Compartment();
const extensions: Extension[] = [
  BAML(),
  EditorView.lineWrapping,
  comparment.of(makeLinter()),
  // hyperLink,
];

export const CodeMirrorViewer = ({
  fileContent,
  lang,
  shouldScrollDown,
}: {
  fileContent: string;
  lang: string;
  shouldScrollDown?: boolean;
}) => {
  const [file, setFileContent] = useAtom(filesAtom);
  const containerRef = useRef<ReactCodeMirrorRef | null>({}); // New ref for the container

  useEffect(() => {
    // const interval = setInterval(() => {
    if (containerRef.current?.view?.contentDOM) {
      const line = containerRef.current.view.state.doc.lineAt(
        containerRef.current.view.state.doc.length
      );
      console.log("line", containerRef.current.view.state.doc);
      if (line) {
        console.log("scrolling down", line);

        containerRef.current.view?.dispatch({
          selection: { anchor: line.from, head: undefined },
          scrollIntoView: true,
        });
      }

      // // Scroll to the bottom of the container
      // containerRef.current.contentDOM.scrollIntoView({
      //   behavior: "smooth",
      // });
    }
    // }, 1000); // Adjust the interval time (in milliseconds) as needed

    // return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [file, containerRef]);

  // useEffect(() => {
  //   if (viewRef && viewRef.current) {
  //     if (viewRef.current?.contentDOM) {
  //       console.log("scrolling down");

  //       // Scroll to the bottom of the editor
  //       viewRef.current?.contentDOM?.scrollTo({
  //         behavior: "smooth",
  //         top: viewRef.current.contentHeight,
  //       });
  //     }
  //   }
  // }, [shouldScrollDown, file, viewRef]);
  return (
    <div
      className="w-full max-h-[700px] h-full overflow-y-clip rounded-md"
      // ref={containerRef} // Attach the ref to the container
    >
      <div
        className="relative"
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <CodeMirror
          key={lang}
          id={lang}
          value={Object.values(file)[0]}
          onChange={(value) => {
            setFileContent({
              "baml_src/main.baml": value,
            });
          }}
          extensions={extensions}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          theme={theme}
          // readOnly={true}
          className="text-xs rounded-md"
          height="100%"
          width="100%"
          maxWidth="100%"
          // ref={viewRef}
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};
