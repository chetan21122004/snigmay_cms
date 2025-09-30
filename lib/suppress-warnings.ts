// Suppress React 19 ref warnings for Radix UI compatibility
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args) => {
    // Suppress React 19 ref deprecation warnings
    if (
      args[0]?.includes?.('Accessing element.ref was removed in React 19') ||
      args[0]?.includes?.('ref is now a regular prop')
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export {} 