import { execSync } from 'child_process';
execSync('npx.cmd prettier --write --parser typescript "src/app/**/page.tsx"', { stdio: 'inherit', cwd: import.meta.dirname });
