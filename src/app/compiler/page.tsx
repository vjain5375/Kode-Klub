"use client";

import { useState, useCallback } from "react";
import { CodeEditor } from "@/components/features/compiler/code-editor";
import { LanguageSelect } from "@/components/features/compiler/language-select";
import { StdinPanel } from "@/components/features/compiler/stdin-panel";
import { OutputPanel } from "@/components/features/compiler/output-panel";
import { ExecutionStatusBar } from "@/components/features/compiler/execution-status";
import { Button } from "@/components/ui/button";
import { LANGUAGES, getLanguage } from "@/lib/compiler/languages";
import { executeCode } from "@/lib/compiler/api";
import { Language, ExecutionResult } from "@/types/compiler";
import { Play, Square, RotateCcw, Settings2 } from "lucide-react";

export default function CompilerPage() {
    const [language, setLanguage] = useState<Language>(LANGUAGES.python);
    const [code, setCode] = useState(LANGUAGES.python.template);
    const [stdin, setStdin] = useState("");
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const handleLanguageChange = useCallback((newLanguage: Language) => {
        setLanguage(newLanguage);
        setCode(newLanguage.template);
        setResult(null);
    }, []);

    const handleReset = useCallback(() => {
        setCode(language.template);
        setStdin("");
        setResult(null);
    }, [language]);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setResult({
            stdout: '',
            stderr: '',
            exitCode: null,
            executionTime: null,
            memoryUsed: null,
            status: 'RUNNING',
        });

        try {
            const response = await executeCode({
                language: language.id,
                code,
                stdin,
                timeLimit: 5,
                memoryLimit: 256,
            });

            setResult(response.data);
        } catch (error) {
            setResult({
                stdout: '',
                stderr: error instanceof Error ? error.message : 'Execution failed',
                exitCode: 1,
                executionTime: null,
                memoryUsed: null,
                status: 'INTERNAL_ERROR',
            });
        } finally {
            setIsRunning(false);
        }
    }, [language, code, stdin]);

    const handleStop = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
        setIsRunning(false);
        setResult({
            stdout: '',
            stderr: 'Execution cancelled by user',
            exitCode: null,
            executionTime: null,
            memoryUsed: null,
            status: 'INTERNAL_ERROR',
        });
    }, [abortController]);

    return (
        <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-neutral-950">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-2">
                <div className="flex items-center gap-3">
                    <LanguageSelect
                        value={language.id}
                        onChange={handleLanguageChange}
                    />
                    <div className="h-6 w-px bg-neutral-700" />
                    <span className="text-sm text-neutral-500 font-mono">
                        {language.fileName}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>

                    {isRunning ? (
                        <Button
                            onClick={handleStop}
                            variant="destructive"
                            className="gap-2 bg-red-600 hover:bg-red-500"
                        >
                            <Square className="h-4 w-4" />
                            Stop
                        </Button>
                    ) : (
                        <Button
                            onClick={handleRun}
                            className="gap-2 bg-green-600 hover:bg-green-500"
                        >
                            <Play className="h-4 w-4" />
                            Run Code
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 min-h-0">
                {/* Left Panel - Code Editor */}
                <div className="flex-1 flex flex-col min-w-0">
                    <CodeEditor
                        language={language.monacoId}
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        fileName={language.fileName}
                        readOnly={isRunning}
                    />
                </div>

                {/* Right Panel - Input/Output */}
                <div className="w-[400px] flex flex-col border-l border-neutral-800">
                    {/* Stdin Panel */}
                    <div className="h-[200px] border-b border-neutral-800">
                        <StdinPanel
                            value={stdin}
                            onChange={setStdin}
                            disabled={isRunning}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="flex-1 min-h-0">
                        <OutputPanel
                            result={result}
                            isRunning={isRunning}
                        />
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <ExecutionStatusBar
                result={result}
                isRunning={isRunning}
                fileName={language.fileName}
            />
        </div>
    );
}
