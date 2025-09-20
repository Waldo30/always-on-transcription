type LogContext = Record<string, unknown> | undefined;

export function logError(message: string, error?: unknown, context?: LogContext) {
  const errObj = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error };
  if (context) {
    console.error(message, { ...errObj, context });
  } else {
    console.error(message, errObj);
  }
}


