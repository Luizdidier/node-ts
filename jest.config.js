module.exports = {
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    collectCoverageFrom: [
        '**/*.{ts, js}',
        '!**/node_modules/**',
        '!**/src/config/**',
        '!**/src/routes.ts',
        '!**/src/knexfile.ts',
        '!**/src/server.ts',
        '!**/src/app.ts'
    ]
}
