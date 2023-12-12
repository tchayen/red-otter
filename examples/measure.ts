export function measure(tag: string, operation: () => void) {
  const start = performance.now();
  operation();
  const end = performance.now();
  console.log(`${tag} took ${(end - start).toFixed(2)}ms.`);
}
