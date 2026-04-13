export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value as Record<string, any>)) {
          if (typeof subValue === 'object') {
            for (const [clauseKey, clauseValue] of Object.entries(subValue as Record<string, string>)) {
              searchParams.set(`${key}[${subKey}][${clauseKey}]`, String(clauseValue));
            }
          } else {
            searchParams.set(`${key}[${subKey}]`, String(subValue));
          }
        }
      } else {
        searchParams.set(key, String(value));
      }
    }
  }
  return searchParams.toString();
}

export function parseFiltersFromUrl(search: string): Record<string, Record<string, string>> {
  const filters: Record<string, Record<string, string>> = {};
  const params = new URLSearchParams(search);
  params.forEach((value, key) => {
    const match = key.match(/^filters\[(\w+)]\[(\w+)]$/);
    if (match) {
      const [, filterKey, clause] = match;
      if (!filters[filterKey]) filters[filterKey] = {};
      filters[filterKey][clause] = value;
    }
  });
  return filters;
}
