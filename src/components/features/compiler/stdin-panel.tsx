"use client";

import { Textarea } from "@/components/ui/textarea";

interface StdinPanelProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function StdinPanel({ value, onChange, disabled }: StdinPanelProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-800/50 px-4 py-2">
                <span className="text-sm font-medium text-neutral-300">Input (stdin)</span>
            </div>
            <Textarea
                value={value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Enter input for your program..."
                className="flex-1 resize-none rounded-none border-0 bg-neutral-950 font-mono text-sm text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
        </div>
    );
}
