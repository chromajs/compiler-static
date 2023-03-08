#! /usr/bin/env node

import { parse } from "ts-command-line-args";
import { resolve, join } from "path";
import { existsSync, rmSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import compile from "@chromajs/chroma-compiler";

function getPaths(dirPath: string) {
    let filePaths: string[] = [];

    try {
        readdirSync(dirPath).forEach(file => {
            if (statSync(join(dirPath, "/", file)).isDirectory()) {
                filePaths = filePaths.concat(getPaths(dirPath + "/" + file));
            } else {
                const absolutePath = resolve(dirPath, file);
                filePaths.push(absolutePath);
            }
        });
    } catch (e) {
        console.log("Failed! Failed to read directory!");
        process.exit(1);
    }

    return filePaths;
}

interface CLIArgs {
    srcPath: string
    outPath: string
    help?: boolean
}

const args = parse<CLIArgs>(
    {
        srcPath: { type: String, alias: "s", description: "The source folder of your Chroma project" },
        outPath: { type: String, alias: "o", description: "The out folder of your compiled Chroma project" },
        help: { type: Boolean, optional: true, alias: "h", description: "Prints this message" },
    },
    {
        helpArg: "help",
        headerContentSections: [{ header: "Chroma HTML Compiler Help", content: "Thanks for supporting us - ChromaJS team" }],
        footerContentSections: [{ header: "Chroma HTML Compiler Help", content: `Copyright © ${new Date().getFullYear()} Chroma` }],
    },
);

if (!args.help) {
    if (!existsSync(args.srcPath)) {
        console.log("Failed! SRC Path must exist!");
        process.exit(1);
    }

    if (existsSync(args.outPath)) {
        try {
            rmSync(args.outPath, { recursive: true, force: true });
        } catch (e) {
            console.log("Failed! Failed to delete OUT Path");
            process.exit(1);
        }
    }

    try {
        mkdirSync(args.outPath);
    } catch (e) {
        console.log("Failed! Failed to create directory OUT Path");
        process.exit(1);
    }

    const rootDir = resolve(args.srcPath);
    const files = getPaths(args.srcPath);
    const htmlFiles = files.filter(file => file.match(/.html$/));
    const otherFiles = files.filter(file => !file.match(/.html$/));

    otherFiles.map(file => {
        const relativePath = file.split(rootDir)[1];
        const relativeSplit = relativePath.split("\\");

        if (relativeSplit.length > 2) {
            mkdirSync(join(args.outPath, relativeSplit[relativeSplit.length - 2]));
        }

        copyFileSync(file, join(args.outPath, relativePath));
    });

    htmlFiles.map(file => {
        const relativePath = file.split(rootDir)[1];
        const relativeSplit = relativePath.split("\\");

        if (relativeSplit.length > 2) {
            mkdirSync(join(args.outPath, relativeSplit[relativeSplit.length - 2]));
        }

        const content = compile(readFileSync(file, "utf-8"));

        writeFileSync(join(args.outPath, relativePath), content, "utf-8");
    });
}