"use client";

import { ExecutionResult, ExecutionStatus } from "@/types/compiler";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Loader2, AlertTriangle, Cpu } from "lucide-react";

interface ExecutionStatusProps {
    result: ExecutionResult | null;
    isRunning: boolean;
    fileName?: string;
}

const STATUS_CONFIG: Record<ExecutionStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
    IDLE: { icon: Clock, color: "text-neutral-500", label: "Ready" },
    RUNNING: { icon: Loader2, color: "text-blue-400", label: "Running..." },
    SUCCESS: { icon: CheckCircle2, color: "text-green-400", label: "Success" },
    COMPILATION_ERROR: { icon: XCircle, color: "text-red-400", label: "Compilation Error" },
    RUNTIME_ERROR: { icon: XCircle, color: "text-orange-400", label: "Runtime Error" },
    TIME_LIMIT_EXCEEDED: { icon: AlertTriangle, color: "text-yellow-400", label: "Time Limit Exceeded" },
    MEMORY_LIMIT_EXCEEDED: { icon: AlertTriangle, color: "text-purple-400", label: "Memory Limit Exceeded" },
    INTERNAL_ERROR: { icon: XCircle, color: "text-red-400", label: "Internal Error" },
};

export function ExecutionStatusBar({ result, isRunning, fileName }: ExecutionStatusProps) {
    const status: ExecutionStatus = isRunning ? 'RUNNING' : (result?.status || 'IDLE');
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-between border-t border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm">
            <div className="flex items-center gap-4">
                {/* Status */}
                <div className={cn("flex items-center gap-1.5", config.color)}>
                    <Icon className={cn("h-4 w-4", isRunning && "animate-spin")} />
                    <span>{config.label}</span>
                </div>

                {/* File name */}
                {fileName && (
                    <div className="text-neutral-500 font-mono text-xs">
                        {fileName}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 text-neutral-400">
                {/* Execution Time */}
                {result?.executionTime !== null && result?.executionTime !== undefined && (
                    <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{result.executionTime.toFixed(0)}ms</span>
                    </div>
                )}

                {/* Memory Usage */}
                {result?.memoryUsed !== null && result?.memoryUsed !== undefined && (
                    <div className="flex items-center gap-1">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>{result.memoryUsed.toFixed(1)}MB</span>
                    </div>
                )}
            </div>
        </div>
    );
}
