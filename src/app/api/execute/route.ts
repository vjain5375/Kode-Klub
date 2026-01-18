import { NextRequest, NextResponse } from "next/server";
import { ExecutionResponse, ExecutionStatus } from "@/types/compiler";

// Piston API - Free, no API key required!
const PISTON_API_URL = "https://emkc.org/api/v2/piston";

// Language mapping for Piston
const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
    python: { language: "python", version: "3.10.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "c++", version: "10.2.0" },
    java: { language: "java", version: "15.0.2" },
    go: { language: "go", version: "1.16.2" },
    rust: { language: "rust", version: "1.68.2" },
    bash: { language: "bash", version: "5.2.0" },
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

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

interface PistonResult {
    run: {
        stdout: string;
        stderr: string;
        code: number;
        signal: string | null;
        output: string;
    };
    compile?: {
        stdout: string;
        stderr: string;
        code: number;
    };
}

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please wait.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { language, code, stdin } = body;

        if (!language || !code) {
            return NextResponse.json(
                { success: false, error: 'Language and code are required' },
                { status: 400 }
            );
        }

        const langConfig = PISTON_LANGUAGES[language];
        if (!langConfig) {
            return NextResponse.json(
                { success: false, error: `Unsupported language: ${language}` },
                { status: 400 }
            );
        }

        // Check code size
        if (code.length > 64 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Code exceeds maximum size of 64KB' },
                { status: 400 }
            );
        }

        // Execute with Piston API
        const startTime = Date.now();

        const pistonResponse = await fetch(`${PISTON_API_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: langConfig.language,
                version: langConfig.version,
                files: [{ content: code }],
                stdin: stdin || '',
                run_timeout: 10000, // 10 seconds
            }),
        });

        const executionTime = Date.now() - startTime;

        if (!pistonResponse.ok) {
            const errorText = await pistonResponse.text();
            console.error('Piston error:', errorText);
            return NextResponse.json(
                { success: false, error: 'Execution service error' },
                { status: 502 }
            );
        }

        const result: PistonResult = await pistonResponse.json();

        // Determine status
        let status: ExecutionStatus = 'SUCCESS';
        if (result.compile && result.compile.code !== 0) {
            status = 'COMPILATION_ERROR';
        } else if (result.run.code !== 0) {
            status = 'RUNTIME_ERROR';
        } else if (result.run.signal === 'SIGKILL') {
            status = 'TIME_LIMIT_EXCEEDED';
        }

        const response: ExecutionResponse = {
            success: status === 'SUCCESS',
            data: {
                stdout: result.run.stdout || '',
                stderr: result.run.stderr || '',
                exitCode: result.run.code,
                executionTime,
                memoryUsed: null, // Piston doesn't provide memory info
                status,
                compileOutput: result.compile?.stderr || undefined,
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
