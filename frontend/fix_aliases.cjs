const fs = require('fs');

const tsconfigApp = JSON.parse(fs.readFileSync('tsconfig.app.json', 'utf8'));
tsconfigApp.compilerOptions.baseUrl = ".";
tsconfigApp.compilerOptions.paths = {
  "@/*": ["./src/*"]
};
fs.writeFileSync('tsconfig.app.json', JSON.stringify(tsconfigApp, null, 2));

const componentsJson = JSON.parse(fs.readFileSync('components.json', 'utf8'));
componentsJson.aliases = {
  "components": "@/components",
  "utils": "@/lib/utils",
  "ui": "@/components/ui",
  "lib": "@/lib",
  "hooks": "@/hooks"
};
fs.writeFileSync('components.json', JSON.stringify(componentsJson, null, 2));
