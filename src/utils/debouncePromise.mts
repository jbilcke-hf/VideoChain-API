/*

Here's how you can use the `debouncePromise` function:

```typescript
async function fetchData(query: string): Promise<string> {
  // Simulating an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Results for ${query}`);
    }, 500);
  });
}

const debouncedFetchData = debouncePromise(fetchData, 300);

(async () => {
  try {
    console.log(await debouncedFetchData("query 1")); // This will be ignored
    console.log(await debouncedFetchData("query 2")); // This will be ignored
    console.log(await debouncedFetchData("query 3")); // This will return "Results for query 3"
  } catch (error) {
    console.error(error);
  }
})();
```

The `debouncePromise` function takes a Promise-based function `func` and a `wait` time as its arguments.
It returns a debounced version of the given function that, when called multiple times within the specified wait time, will only execute the last call.
*/

type DebouncedFunction<T extends any[], R> = ((...args: T) => R) & {
  clear: () => void
}

export function debouncePromise<T extends any[], R>(
  func: (...args: T) => Promise<R>,
  wait: number
): DebouncedFunction<T, Promise<R | undefined>> {
  let timeout: NodeJS.Timeout | undefined

  const debounced = (...args: T) => {
    return new Promise<R | undefined>((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(async () => {
        try {
          const result = await func(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, wait)
    })
  }

  debounced.clear = () => {
    if (timeout) {
      clearTimeout(timeout)
    }
  }

  return debounced
}