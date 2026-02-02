/** @type {import('prettier').Config} */
export default {
  // Semicolons at end of statements
  semi: true,

  // Use double quotes instead of single quotes
  singleQuote: false,

  // Add trailing commas where valid in ES5 (objects, arrays, etc.)
  trailingComma: "all",

  // Print width - wrap lines that exceed this
  printWidth: 80,

  // Number of spaces per indentation level
  tabWidth: 2,

  // Use spaces instead of tabs
  useTabs: false,

  // Always add parentheses around arrow function parameters
  arrowParens: "always",

  // Put the > of a multi-line JSX element at the end of the last line
  bracketSameLine: false,

  // Add spaces inside object literals
  bracketSpacing: true,

  // Which end of line characters to use
  endOfLine: "lf",

  // Format quoted code embedded in Markdown
  embeddedLanguageFormatting: "auto",
};
