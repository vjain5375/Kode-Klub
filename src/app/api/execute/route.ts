import { NextRequest, NextResponse } from "next/server";
import { LANGUAGES } from "@/lib/compiler/languages";
import { ExecutionResponse, ExecutionStatus } from "@/types/compiler";

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

interface Judge0Result {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    exit_code: number | null;
    time: string | null;
    memory: number | null;
    status: {
        id: number;
        description: string;
    };
}

const STATUS_MAP: Record<number, ExecutionStatus> = {
    1: 'RUNNING',
    2: 'RUNNING',
    3: 'SUCCESS',
    4: 'RUNTIME_ERROR',
    5: 'TIME_LIMIT_EXCEEDED',
    6: 'COMPILATION_ERROR',
    7: 'RUNTIME_ERROR',
    8: 'RUNTIME_ERROR',
    9: 'RUNTIME_ERROR',
    10: 'RUNTIME_ERROR',
    11: 'RUNTIME_ERROR',
    12: 'RUNTIME_ERROR',
    13: 'INTERNAL_ERROR',
    14: 'INTERNAL_ERROR',
};

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please wait before trying again.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { language, code, stdin, timeLimit = 5, memoryLimit = 256 } = body;

        // Validate input
        if (!language || !code) {
            return NextResponse.json(
                { success: false, error: 'Language and code are required' },
                { status: 400 }
            );
        }

        const langConfig = LANGUAGES[language];
        if (!langConfig) {
            return NextResponse.json(
                { success: false, error: `Unsupported language: ${language}` },
                { status: 400 }
            );
        }

        // Check code size (64KB max)
        if (code.length > 64 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Code exceeds maximum size of 64KB' },
                { status: 400 }
            );
        }

        // Check stdin size (1MB max)
        if (stdin && stdin.length > 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Input exceeds maximum size of 1MB' },
                { status: 400 }
            );
        }

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (JUDGE0_API_URL.includes('rapidapi')) {
            headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
            headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
        }

        // Submit to Judge0
        const submitResponse = await fetch(
            `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    source_code: code,
                    language_id: langConfig.judge0Id,
                    stdin: stdin || '',
                    cpu_time_limit: timeLimit,
                    memory_limit: memoryLimit * 1024, // KB
                }),
            }
        );

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error('Judge0 error:', errorText);
            return NextResponse.json(
                { success: false, error: 'Execution service error' },
                { status: 502 }
            );
        }

        const result: Judge0Result = await submitResponse.json();
        const status = STATUS_MAP[result.status.id] || 'INTERNAL_ERROR';

        const response: ExecutionResponse = {
            success: status === 'SUCCESS',
            data: {
                stdout: result.stdout || '',
                stderr: result.stderr || result.message || '',
                exitCode: result.exit_code,
                executionTime: result.time ? parseFloat(result.time) * 1000 : null,
                memoryUsed: result.memory ? result.memory / 1024 : null,
                status,
                compileOutput: result.compile_output || undefined,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Execution error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
