import { Option } from 'funfix-core';
import { pickBy } from './index';

type Maybe<T> = undefined | T;

const isMaybeDefined = <T>(maybeT: Maybe<T>): maybeT is T => maybeT !== undefined;

/** Takes a dictionary containing `Maybe`s and returns a dictionary of all the non-empty values. */
// Inspired by
// http://hackage.haskell.org/package/base-4.12.0.0/docs/Data-Maybe.html#v:catMaybes
// https://github.com/gcanti/fp-ts/blob/42870714ebcae4ecf132291c687c845b6837b7d2/docs/Record.md#compact
export const catMaybesDictionary = <T>(maybesDictionary: {
    [index: string]: Maybe<T>;
}): { [index: string]: T } =>
    pickBy(
        // This cast shouldn't be necessary: https://github.com/Microsoft/TypeScript/issues/29246
        maybesDictionary as Record<string, Maybe<T>>,
        (_key, value): value is T => isMaybeDefined(value),
    );

export const mapValueIfDefined = <V, V2>(fn: (v: V) => V2) => (maybe: Maybe<V>) =>
    Option.of(maybe)
        .map(fn)
        .getOrElse(undefined);
