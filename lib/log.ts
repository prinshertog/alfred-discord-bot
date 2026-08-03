function timestamp() {
  return new Date().toISOString();
}

export function logMessage(message: string, component: string) {
    console.log(`${timestamp()} INFO (${component}): ${message}`);
}

export function errorMessage(message: string, component: string) {
    console.error(`${timestamp()} ERROR (${component}): ${message}`)
}