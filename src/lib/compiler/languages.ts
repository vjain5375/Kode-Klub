import { Language, LanguageConfig } from "@/types/compiler";

// Judge0 language IDs - https://ce.judge0.com/
export const LANGUAGES: LanguageConfig = {
    python: {
        id: "python",
        name: "Python 3",
        monacoId: "python",
        judge0Id: 71,
        extension: ".py",
        fileName: "solution.py",
        template: `def main():
    # Write your code here
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
    },
    javascript: {
        id: "javascript",
        name: "JavaScript (Node.js)",
        monacoId: "javascript",
        judge0Id: 63,
        extension: ".js",
        fileName: "solution.js",
        template: `// Write your code here
console.log("Hello, World!");`,
    },
    typescript: {
        id: "typescript",
        name: "TypeScript",
        monacoId: "typescript",
        judge0Id: 74,
        extension: ".ts",
        fileName: "solution.ts",
        template: `// Write your code here
const greeting: string = "Hello, World!";
console.log(greeting);`,
    },
    c: {
        id: "c",
        name: "C (GCC)",
        monacoId: "c",
        judge0Id: 50,
        extension: ".c",
        fileName: "solution.c",
        template: `#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello, World!\\n");
    return 0;
}`,
    },
    cpp: {
        id: "cpp",
        name: "C++ (G++)",
        monacoId: "cpp",
        judge0Id: 54,
        extension: ".cpp",
        fileName: "solution.cpp",
        template: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
    },
    java: {
        id: "java",
        name: "Java (OpenJDK)",
        monacoId: "java",
        judge0Id: 62,
        extension: ".java",
        fileName: "Main.java",
        template: `public class Main {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}`,
    },
    go: {
        id: "go",
        name: "Go",
        monacoId: "go",
        judge0Id: 60,
        extension: ".go",
        fileName: "solution.go",
        template: `package main

import "fmt"

func main() {
    // Write your code here
    fmt.Println("Hello, World!")
}`,
    },
    rust: {
        id: "rust",
        name: "Rust",
        monacoId: "rust",
        judge0Id: 73,
        extension: ".rs",
        fileName: "solution.rs",
        template: `fn main() {
    // Write your code here
    println!("Hello, World!");
}`,
    },
    bash: {
        id: "bash",
        name: "Bash",
        monacoId: "shell",
        judge0Id: 46,
        extension: ".sh",
        fileName: "solution.sh",
        template: `#!/bin/bash
# Write your code here
echo "Hello, World!"`,
    },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export function getLanguage(id: string): Language | undefined {
    return LANGUAGES[id];
}

export function getDefaultTemplate(id: string): string {
    return LANGUAGES[id]?.template || "";
}
