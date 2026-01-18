// TypeScript types for the compiler system

export type ExecutionStatus =
    | 'IDLE'
    | 'RUNNING'
    | 'SUCCESS'
    | 'COMPILATION_ERROR'
    | 'RUNTIME_ERROR'
    | 'TIME_LIMIT_EXCEEDED'
    | 'MEMORY_LIMIT_EXCEEDED'
    | 'INTERNAL_ERROR';

export interface ExecutionRequest {
    language: string;
    code: string;
    stdin?: string;
    timeLimit?: number;
    memoryLimit?: number;
}

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    executionTime: number | null;
    memoryUsed: number | null;
    status: ExecutionStatus;
    compileOutput?: string;
}

export interface ExecutionResponse {
    success: boolean;
    data: ExecutionResult;
}

export interface Language {
    id: string;
    name: string;
    monacoId: string;
    judge0Id: number;
    extension: string;
    fileName: string;
    template: string;
}

export interface LanguageConfig {
    [key: string]: Language;
}
