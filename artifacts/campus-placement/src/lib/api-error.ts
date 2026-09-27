export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string') {
      return (data as { message: string }).message;
    }
    if (data && typeof data === 'object') {
      const fieldMessages = Object.values(data as Record<string, unknown>).filter(
        (value): value is string => typeof value === 'string',
      );
      if (fieldMessages.length > 0) return fieldMessages.join(' ');
    }
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.replace(/^HTTP \d+ [^:]+:\s*/, '');
    }
  }
  return fallback;
}