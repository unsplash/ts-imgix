import { Option } from 'funfix-core';
import pickBy from 'lodash/pickBy';

type Maybe<T> = undefined | T;

const isMaybeDefined = <T>(maybeT: Maybe<T>): maybeT is T => maybeT !== undefined;

export const catMaybesDictionary = <T>(maybesDictionary: {
    [index: string]: Maybe<T>;
}): { [index: string]: T } => pickBy(maybesDictionary, isMaybeDefined);

export const mapValueIfDefined = <V, V2>(fn: (v: V) => V2) => (maybe: Maybe<V>) =>
    Option.of(maybe)
        .map(fn)
        .getOrElse(undefined);
