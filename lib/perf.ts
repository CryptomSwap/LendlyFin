export async function measurePerf<T>(name: string, run: () => Promise<T>): Promise<T> {
  const startedAt = Date.now();
  try {
    return await run();
  } finally {
    const elapsedMs = Date.now() - startedAt;
    console.info(`[perf] ${name} ${elapsedMs}ms`);
  }
}
