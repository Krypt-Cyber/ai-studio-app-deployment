
// Utility function to handle circular references in JSON.stringify
export const getCircularReplacer = () => {
  const seen = new WeakSet(); // Use WeakSet to allow garbage collection

  return function(key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        // console.warn(`[jsonUtils.ts] Circular reference detected. Path: (tracking simplified). Replacing with "[Circular]".`);
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
};