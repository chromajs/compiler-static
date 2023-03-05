#! /usr/bin/env node

import { parse } from "ts-command-line-args";
import { resolve, join } from "path";
import { existsSync, rmSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { marked } from "marked";
import dompurify from "dompurify";
import { JSDOM } from "jsdom";
import { minify } from "html-minifier";

const window = new JSDOM("").window;
const purify = dompurify(window as unknown as Window);

const chromaRegex = /<chroma>([^]*?)<\/chroma>/gi;
const chromaSrcRegex = /<chroma src="([^]*?)"([^]*?)>/gi;

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
    tabSpace?: number
    help?: boolean
}

const args = parse<CLIArgs>(
    {
        srcPath: { type: String, alias: "s", description: "The source folder of your Chroma project" },
        outPath: { type: String, alias: "o", description: "The out folder of your compiled Chroma project" },
        tabSpace: { type: Number, alias: "t", optional: true, description: "Markdown is white space sensative so we need to know the tab size of your file. Default: 4", defaultValue: 4 },
        help: { type: Boolean, optional: true, alias: "h", description: "Prints this message" },
    },
    {
        helpArg: "help",
        headerContentSections: [{ header: "Chroma HTML Compiler Help", content: "Thanks for supporting us - ChromaJS team" }],
        footerContentSections: [{ header: "Chroma HTML Compiler Help", content: `Copyright © ${new Date().getFullYear()} Chroma` }],
    },
);

if (!args.help) {
    let tabsToSpaces = "";
    for (let i = 0; i < args.tabSpace!; i++) {
        tabsToSpaces += " ";
    }

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

        let content = readFileSync(file, "utf-8");
        content = minify(content, {
            removeComments: true,
        });

        const pre = [...content.matchAll(chromaSrcRegex)];
        const code = [...content.matchAll(chromaRegex)];

        pre.map(chromaReg => {
            const chromaString = chromaReg[0];
            let md;
            try {
                md = readFileSync((chromaString.match(/"([^]*?)"/) as RegExpMatchArray)[0].split("\"")[1], "utf-8");
            } catch (e) {
                console.log("[Chroma] Failed to compile! Chroma SRC Markdown File does not exist!");
                process.exit(1);
            }

            content = content.replace(
                chromaString,
                purify.sanitize(marked(md, { async: false }))
            );
        });

        code.map((chromaReg) => {
            const chromaString = chromaReg[0];

            while (content.indexOf(chromaString) !== -1) {
                const noTag = chromaString
                    .replace(/<chroma>/gi, "")
                    .replace(/<\/chroma>/gi, "")
                    .replace(/\t/gi, tabsToSpaces);

                let splitter = "\n";
                if (noTag.includes("\r\n")) {
                    splitter = "\r\n";
                }

                let lines = noTag.split(splitter);
                let whiteSpace = 0;
                let clauseCodeIndex;
                for (let i = 0; i < lines.length; i++) {
                    whiteSpace = 0;

                    const line = lines[i];
                    let found = false;
                    for (let j = 0; j < line.length; j++) {
                        if (line[j] === "|") {
                            clauseCodeIndex = i;
                            found = true;
                            break;
                        } else {
                            whiteSpace++;
                        }
                    }

                    if (found) {
                        break;
                    }
                }

                if (!clauseCodeIndex) {
                    console.log(`[Chroma] Failed to compile! HTML File missing Clause Code: "|"`);
                    process.exit(1);
                }

                lines = lines.slice(clauseCodeIndex + 1);
                lines.map((line, index) => {
                    let whiteSpaceCount = 0;
                    let firstChar;

                    for (let i = 0; i < line.length; i++) {
                        if (!line[i].match(/ |\n|\r|\t/)) {
                            firstChar = i;
                            break;
                        }
                    }
                    //console.log(firstChar);

                    if (!firstChar) {
                        firstChar = line.length - 1;
                    }

                    for (let i = 0; i < firstChar; i++) {
                        if (whiteSpaceCount < whiteSpace && line[i].match(/ |\n|\r|\t/)) {
                            whiteSpaceCount++;
                        }
                    }

                    lines[index] = lines[index].slice(whiteSpaceCount);
                });

                content = content.replace(
                    chromaString,
                    purify.sanitize(marked(lines.join(splitter), { async: false }))
                );
            }
        });

        writeFileSync(join(args.outPath, relativePath), content, "utf-8");
    });
}