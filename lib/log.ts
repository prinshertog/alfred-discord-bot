export function logMessage(message: string, component: string) {
    console.log(`INFO (${component}): ${message}`);
}

export function errorMessage(message: string, component: string) {
    console.error(`(${component}): ${message}`)
}