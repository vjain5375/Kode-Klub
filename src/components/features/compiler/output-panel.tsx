"use client";

import { ExecutionResult } from "@/types/compiler";
import { cn } from "@/lib/utils";

interface OutputPanelProps {
    result: ExecutionResult | null;
    isRunning: boolean;
}

export function OutputPanel({ result, isRunning }: OutputPanelProps) {
    const hasError = result?.status && !['SUCCESS', 'IDLE', 'RUNNING'].includes(result.status);
    const hasCompileError = result?.status === 'COMPILATION_ERROR';

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-800/50 px-4 py-2">
                <span className="text-sm font-medium text-neutral-300">Output</span>
                {result?.status && result.status !== 'IDLE' && (
                    <span className={cn(
                        "text-xs px-2 py-0.5 rounded font-mono",
                        result.status === 'SUCCESS' && "bg-green-500/20 text-green-400",
                        result.status === 'RUNNING' && "bg-blue-500/20 text-blue-400",
                        result.status === 'COMPILATION_ERROR' && "bg-red-500/20 text-red-400",
                        result.status === 'RUNTIME_ERROR' && "bg-orange-500/20 text-orange-400",
                        result.status === 'TIME_LIMIT_EXCEEDED' && "bg-yellow-500/20 text-yellow-400",
                        result.status === 'MEMORY_LIMIT_EXCEEDED' && "bg-purple-500/20 text-purple-400",
                        result.status === 'INTERNAL_ERROR' && "bg-red-500/20 text-red-400",
                    )}>
                        {result.status.replace(/_/g, ' ')}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-neutral-950 p-4 font-mono text-sm">
                {isRunning ? (
                    <div className="flex items-center gap-2 text-blue-400">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        Running code...
                    </div>
                ) : result ? (
                    <div className="space-y-4">
                        {/* Compilation Error */}
                        {hasCompileError && result.compileOutput && (
                            <div>
                                <div className="text-red-400 mb-1 text-xs uppercase tracking-wide">Compilation Error</div>
                                <pre className="whitespace-pre-wrap text-red-300">{result.compileOutput}</pre>
                            </div>
                        )}

                        {/* Stdout */}
                        {result.stdout && (
                            <div>
                                <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wide">stdout</div>
                                <pre className="whitespace-pre-wrap text-neutral-200">{result.stdout}</pre>
                            </div>
                        )}

                        {/* Stderr */}
                        {result.stderr && (
                            <div>
                                <div className="text-red-400 mb-1 text-xs uppercase tracking-wide">stderr</div>
                                <pre className="whitespace-pre-wrap text-red-300">{result.stderr}</pre>
                            </div>
                        )}

                        {/* Empty output message */}
                        {!result.stdout && !result.stderr && !result.compileOutput && result.status === 'SUCCESS' && (
                            <div className="text-neutral-500 italic">Program completed with no output.</div>
                        )}
                    </div>
                ) : (
                    <div className="text-neutral-500">
                        Run your code to see output here...
                    </div>
                )}
            </div>
        </div>
    );
}
