const tuple = <T extends Array<unknown>>(...args: T): T => args;

// `Object.keys` does not return the keys as string literals, only strings. Use this helper as a
// workaround. https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208
const keys = <O extends object>(obj: O) => Object.keys(obj) as Array<keyof O>;

// `Object.entries` is ES2017, but this lib only supports ES2015 at runtime, so we must define our
// own version.
const entries = <K extends string, V>(obj: Record<K, V>) =>
    keys(obj).map(key => tuple(key, obj[key]));
const fromEntries = <K extends string, V>(arr: Array<[K, V]>) =>
    // `Object.assign` is poorly typed: it returns `any` when spreading. Use cast to workaround.
    Object.assign({}, ...arr.map(([k, v]) => ({ [k]: v }))) as Record<K, V>;

// Inspired by https://stackoverflow.com/a/37616104/5932012
export const pickBy = <K extends string, V, Result extends V>(
    obj: Record<K, V>,
    predicate: (key: K, value: V) => value is Result,
) =>
    fromEntries(
        entries(obj).filter(
            (entry): entry is [K, Result] => {
                const [key, value] = entry;
                return predicate(key, value);
            },
        ),
    );
