function timestamp() {
  return new Date().toISOString();
}

export function logMessage(message: string, component: string, guildName?: string) {
    console.log(`${timestamp()} INFO (Guild: ${guildName ?? "Not specified"}) (${component}): ${message}`);
}

export function errorMessage(message: string, component: string, guildName?: string) {
    console.error(`${timestamp()} ERROR (Guild: ${guildName ?? "Not specified"}) (${component}): ${message}`)
}