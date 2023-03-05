# chroma-html-compiler

Chroma's Markdown HTML compiler

# Installation/Usage

```bash
npx chroma-html-compiler -h
```

**chroma-html-compiler** expects two arguments and has one optional argument:

-   --srcPath (-s) which defines the directory to compile HTML files from
-   --outPath (-o) which defines the directory to output compiled HTML files and other project dependencies
-   [--tabSpace (-t)] which defines how many spaces there are per tab. Defaults to 4.

When running Chroma HTML Compiler, Chroma will keep the directory structure of your project,
it will also keep all additional files in the directory that are not HTML files (ie. js, css, ect.) and
after it will add compiled HTML files in the correct directory structure

# Warnings

**Markdown is effected by CSS!**

# Clause Code

In Chroma, there is something called the Clause Code. The clause code comes at the start of every chroma tag (except for src chroma tags)
and it tells the compiler the correct spacing of your program. This is needed because Markdown is whitespace sensitive so the character "|"
at the start of your Chroma tags tells the compiler the correct spacing of your program.

**|**

# Chroma Tags

There are two types of Chroma tags, normal Chroma tags, and SRC Chroma tags. Normal Chroma tags act just like a Markdown language in your HTML,
you type Markdown in the tags (with a Clause Code) and it will compile it at build time.

SRC Chroma tags are self closing tags that allow you to put a "src='Markdown file location here'" in the tag and at build time, the tag
will be replaced with the rendered contents of your Markdown file.

# Example

in/test.html

```html
<!DOCTYPE html>
<html>
	<head></head>
	<body>
		|
		<chroma># Hello World!</chroma>
	</body>
</html>
```

```bash
npx chroma-html-compiler -s in/ -o out/
```

out/test.html

```html
<!DOCTYPE html>
<html>
	<head></head>
	<body>
		<h1 id="hello-world">Hello World!</h1>
	</body>
</html>
```

# Example 2

in/test.html

```html
<!DOCTYPE html>
<html>
	<head></head>
	<body>
		<chroma src="./in/test.md" />
	</body>
</html>
```

in/test.md

```markdown
# Hello World!
```

```bash
npx chroma-html-compiler -s in/ -o out/
```

out/test.html

```html
<!DOCTYPE html>
<html>
	<head></head>
	<body>
		<h1 id="hello-world">Hello World!</h1>
	</body>
</html>
```
