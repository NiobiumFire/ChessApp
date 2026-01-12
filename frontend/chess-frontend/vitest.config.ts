import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths()
    ],
    test: {
        globals: true,
        environment: 'jsdom', // browser-like environment for React tests
        include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'], // where the tests are
    },
});