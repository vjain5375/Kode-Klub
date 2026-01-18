"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
    language: string;
    value: string;
    onChange: (value: string | undefined) => void;
    fileName?: string;
    readOnly?: boolean;
}

export function CodeEditor({ language, value, onChange, fileName, readOnly = false }: CodeEditorProps) {
    const { theme } = useTheme();
    const editorTheme = theme === "dark" ? "vs-dark" : "light";

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editor.focus();

        // Configure editor settings
        monaco.editor.defineTheme('kode-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0a0a0a',
                'editor.foreground': '#e5e5e5',
                'editor.lineHighlightBackground': '#1a1a1a',
                'editorLineNumber.foreground': '#525252',
                'editorLineNumber.activeForeground': '#a3a3a3',
                'editor.selectionBackground': '#3b82f640',
                'editor.inactiveSelectionBackground': '#3b82f620',
            },
        });

        monaco.editor.setTheme('kode-dark');
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden rounded-md border border-neutral-700 shadow-sm">
            {/* File name header */}
            {fileName && (
                <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-800/50 px-4 py-2">
                    <span className="text-sm font-mono text-neutral-400">{fileName}</span>
                </div>
            )}

            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    width="100%"
                    language={language.toLowerCase()}
                    value={value}
                    theme={editorTheme}
                    onChange={onChange}
                    onMount={handleEditorDidMount}
                    loading={
                        <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-neutral-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    }
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        readOnly: readOnly,
                        automaticLayout: true,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        fontLigatures: true,
                        tabSize: 4,
                        insertSpaces: true,
                        wordWrap: "off",
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        renderLineHighlight: "line",
                        renderWhitespace: "selection",
                        bracketPairColorization: { enabled: true },
                        padding: { top: 16, bottom: 16 },
                        scrollbar: {
                            vertical: "visible",
                            horizontal: "visible",
                            useShadows: false,
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        },
                    }}
                />
            </div>
        </div>
    );
}
