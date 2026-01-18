import { ExecutionRequest, ExecutionResponse } from "@/types/compiler";

/**
 * Execute code via the internal API route
 * This route handles Judge0 communication server-side for security
 */
export async function executeCode(request: ExecutionRequest): Promise<ExecutionResponse> {
    try {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                data: {
                    stdout: '',
                    stderr: error.error || `HTTP error: ${response.status}`,
                    exitCode: 1,
                    executionTime: null,
                    memoryUsed: null,
                    status: 'INTERNAL_ERROR',
                },
            };
        }

        return await response.json();
    } catch (error) {
        console.error('Execution error:', error);
        return {
            success: false,
            data: {
                stdout: '',
                stderr: error instanceof Error ? error.message : 'Network error occurred',
                exitCode: 1,
                executionTime: null,
                memoryUsed: null,
                status: 'INTERNAL_ERROR',
            },
        };
    }
}
