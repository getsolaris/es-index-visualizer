import React, { useState, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      setInternalValue(value);
      onChange(value);
    }
  };

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      const model = editor.getModel();

      if (!model) return;

      const apiFormatMatch = value.match(
        /^(PUT|POST|GET|DELETE)\s+([^\s{]+)\s*(\{[\s\S]*)/i
      );

      if (apiFormatMatch) {
        const commandLine = model.getLineCount() > 0 ? 1 : 0;
        const lineContent = model.getLineContent(commandLine);
        const apiCommandMatch = lineContent.match(
          /^(PUT|POST|GET|DELETE)\s+([^\s{]+)/i
        );

        if (apiCommandMatch) {
          const methodStart = 0;
          const methodEnd = apiCommandMatch[1].length;
          const indexNameStart = methodEnd + 1;
          const indexNameEnd = indexNameStart + apiCommandMatch[2].length;

          editor.deltaDecorations([], []);

          editor.deltaDecorations(
            [],
            [
              {
                range: new monaco.Range(
                  commandLine,
                  methodStart + 1,
                  commandLine,
                  methodEnd + 1
                ),
                options: {
                  inlineClassName: "es-api-method",
                },
              },
              {
                range: new monaco.Range(
                  commandLine,
                  indexNameStart + 1,
                  commandLine,
                  indexNameEnd + 1
                ),
                options: {
                  inlineClassName: "es-api-index",
                },
              },
            ]
          );
        }

        const jsonStart = value.indexOf("{");
        if (jsonStart > -1) {
          const jsonContent = value.substring(jsonStart);

          try {
            JSON.parse(jsonContent);

            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
              validate: true,
              allowComments: true,
              schemaValidation: "ignore",
            });
          } catch {
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
              validate: false,
            });
          }
        }
      }
    });

    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .es-api-method {
        color: #c586c0 !important;
        font-weight: bold;
      }
      .es-api-index {
        color: #9cdcfe !important;
      }
    `;
    document.head.appendChild(styleElement);

    monaco.editor.defineTheme("es-json-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1E1E1E",
      },
    });

    monaco.editor.setTheme("es-json-theme");
  };

  return (
    <div className="editor-container h-full">
      <Editor
        height="100%"
        defaultLanguage="json"
        value={internalValue}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily:
            "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
          fontSize: 14,
          lineHeight: 22,
          padding: { top: 16, bottom: 16 },
          roundedSelection: true,
          cursorStyle: "line",
          lineNumbers: "on",
          autoIndent: "full",
          renderLineHighlight: "all",
        }}
      />
    </div>
  );
};

export default JsonEditor;
