"use client";

import { LANGUAGE_LIST } from "@/lib/compiler/languages";
import { Language } from "@/types/compiler";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LanguageSelectProps {
    value: string;
    onChange: (language: Language) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
    const handleChange = (id: string) => {
        const language = LANGUAGE_LIST.find(l => l.id === id);
        if (language) {
            onChange(language);
        }
    };

    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-700">
                <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
                {LANGUAGE_LIST.map((lang) => (
                    <SelectItem
                        key={lang.id}
                        value={lang.id}
                        className="text-neutral-200 focus:bg-neutral-800"
                    >
                        {lang.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
