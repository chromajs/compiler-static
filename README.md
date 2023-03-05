# chroma-html-compiler

Chroma's Markdown HTML compiler

# Installation/Usage
```bash
npx chroma-html-compiler -h
```

**chroma-html-compiler** expects two arguments:

- --srcPath (-s) which defines the directory to compile HTML files from
- --outPath (-o) which defines the directory to output compiled HTML files and other project dependencies

When running Chroma HTML Compiler, Chroma will keep the directory structure of your project,
it will also keep all additional files in the directory that are not HTML files (ie. js, css, ect.) and
after it will add compiled HTML files in the correct directory structure

# Warnings
**HTML files must use tabs as there spacing, not spaces! (Will be fixed soon)**

**Tabs are suppressed, so using tab code blocks does not work! (Will be fixed soon)**

**Markdown is only recognized inside \<chrome>\</chrome> tags! (Will be fixed soon)**

**Markdown is effected by CSS!**

# Example
in/test.html
```html
<!DOCTYPE html>
<html>
	<head></head>
	<body>
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