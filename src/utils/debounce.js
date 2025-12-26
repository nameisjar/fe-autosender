// Debounce utility untuk mencegah multiple calls dalam waktu singkat
// Supports async functions dan returns Promise
export function debounce(func, wait = 1000) {
  let timeout;
  let pendingResolvers = [];

  return function executedFunction(...args) {
    clearTimeout(timeout);

    return new Promise((resolve) => {
      pendingResolvers.push(resolve);

      timeout = setTimeout(async () => {
        const resolvers = pendingResolvers;
        pendingResolvers = [];

        try {
          const result = await func.apply(this, args);
          resolvers.forEach((r) => r(result));
        } catch (error) {
          resolvers.forEach((r) => r(undefined));
          throw error;
        }
      }, wait);
    });
  };
}
