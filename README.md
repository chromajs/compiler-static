# @chromajs/compiler-static

The static compiler for Chroma.

# Installation/Usage

```bash
npx chroma-html-compiler -h
```

**chroma-html-compiler** expects two arguments and has one optional argument:

-   --srcPath (-s) which defines the directory to compile HTML files from
-   --outPath (-o) which defines the directory to output compiled HTML files and other project dependencies

When running Chroma HTML Compiler, Chroma will keep the directory structure of your project,
it will also keep all additional files in the directory that are not HTML files (ie. js, css, ect.) and
after it will add compiled HTML files in the correct directory structure.
