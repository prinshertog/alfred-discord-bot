export function logMessage(message: string, component: string) {
    console.log(`${Date.now} INFO (${component}): ${message}`);
}

export function errorMessage(message: string, component: string) {
    console.error(`${Date.now} (${component}): ${message}`)
}