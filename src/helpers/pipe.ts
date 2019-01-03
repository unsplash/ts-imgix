// Copied from
// https://github.com/gcanti/fp-ts/blob/42870714ebcae4ecf132291c687c845b6837b7d2/src/function.ts#L207
/**
 * @function
 * @since 1.0.0
 */
export function pipe<A, B, C>(ab: (a: A) => B, bc: (b: B) => C): (a: A) => C;
export function pipe<A, B, C, D>(ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): (a: A) => D;
export function pipe<A, B, C, D, E>(
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
): (a: A) => E;
export function pipe<A, B, C, D, E, F>(
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
): (a: A) => F;
export function pipe<A, B, C, D, E, F, G>(
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
): (a: A) => G;
export function pipe<A, B, C, D, E, F, G, H>(
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
): (a: A) => H;
export function pipe<A, B, C, D, E, F, G, H, I>(
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
): (a: A) => I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D,
    de: (d: D) => E,
    ef: (e: E) => F,
    fg: (f: F) => G,
    gh: (g: G) => H,
    hi: (h: H) => I,
    ij: (i: I) => J,
): (a: A) => J;
export function pipe(...fns: Function[]): Function {
    const len = fns.length - 1;
    // tslint:disable-next-line no-any
    return function(this: any, x: any) {
        let y = x;
        for (let i = 0; i <= len; i++) {
            y = fns[i].call(this, y);
        }
        return y;
    };
}
