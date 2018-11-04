const inflateCurie = (
  prefixes: ReadonlyArray<[string, string]>,
  value: string
): string => {
  const [prefix] = value.split(':');

  const repl = prefixes.filter(tuple => tuple[0] === prefix)[0];

  return repl ? value.replace(`${repl[0]}:`, repl[1]) : value;
};

const deflateCurie = (
  prefixes: ReadonlyArray<[string, string]>,
  value: string
): string => {
  return prefixes
    .map(tuple => value.replace(tuple[1], `${tuple[0]}:`))
    .filter(s => s !== value)[0];
};

export { deflateCurie, inflateCurie };
