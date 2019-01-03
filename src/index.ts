// tslint:disable-next-line match-default-export-name
import pipe from 'lodash/flow';
import { ParsedUrlQuery } from 'querystring';
import { addQueryToUrl } from 'url-transformers';
import { pickBy } from './helpers';
import { catMaybesDictionary, mapValueIfDefined } from './helpers/maybe';

// https://docs.imgix.com/apis/url/size/fit
export enum ImgixFit {
    crop = 'crop',
    max = 'max',
}

// https://docs.imgix.com/apis/url/size/crop
export type ImgixCrop = Partial<
    Record<
        'top' | 'bottom' | 'left' | 'right' | 'faces' | 'focalpoint' | 'edges' | 'entropy',
        boolean
    >
>;

// https://docs.imgix.com/apis/url/format/cs
export enum ImgixColorSpace {
    srgb = 'srgb',
    adobergb1998 = 'adobergb1998',
    tinysrgb = 'tinysrgb',
    strip = 'strip',
}

// https://docs.imgix.com/apis/url/auto
export type ImgixAuto = Partial<Record<'compress' | 'format', boolean>>;

// https://docs.imgix.com/apis/url/format/ch
export type ImgixClientHints = Partial<Record<'width' | 'dpr' | 'saveData', boolean>>;

// https://docs.imgix.com/apis/url
export type ImgixUrlQueryParams = {
    auto?: ImgixAuto;
    q?: number;
    h?: number;
    w?: number;
    fit?: ImgixFit;
    dpr?: number;
    crop?: ImgixCrop;
    bg?: string;
    ch?: ImgixClientHints;
    blur?: number;
    cs?: ImgixColorSpace;
};

const pickTrueInObject = <K extends string>(obj: Record<K, boolean>) =>
    pickBy(obj, (_key, value): value is true => value);
const pickTrueObjectKeys = pipe(
    pickTrueInObject,
    // tslint:disable-next-line no-unbound-method
    Object.keys,
);
const undefinedIfEmptyString = (str: string): string | undefined => (str === '' ? undefined : str);
const joinWithComma = (strs: string[]) => strs.join(',');
const serializeImgixUrlQueryParamListValue = pipe(
    pickTrueObjectKeys,
    joinWithComma,
    undefinedIfEmptyString,
);

const throwErrorIfNotFinite = (n: number) => {
    if (!isFinite(n)) {
        const error = new Error('Expected number to be finite');
        throw error;
    } else {
        return n;
    }
};

const mapFiniteNumberToStringIfDefined = mapValueIfDefined(
    pipe(
        throwErrorIfNotFinite,
        String,
    ),
);
const mapToSerializedListValueIfDefined = mapValueIfDefined(serializeImgixUrlQueryParamListValue);

const serializeImgixUrlQueryParamValues = (query: ImgixUrlQueryParams): ParsedUrlQuery =>
    pipe(
        (): Record<keyof ImgixUrlQueryParams, string | undefined> => ({
            dpr: mapFiniteNumberToStringIfDefined(query.dpr),
            auto: mapToSerializedListValueIfDefined(query.auto),
            fit: query.fit,
            w: mapFiniteNumberToStringIfDefined(query.w),
            h: mapFiniteNumberToStringIfDefined(query.h),
            q: mapFiniteNumberToStringIfDefined(query.q),
            cs: query.cs,
            crop: mapToSerializedListValueIfDefined(query.crop),
            bg: query.bg,
            ch: mapToSerializedListValueIfDefined(query.ch),
            blur: mapFiniteNumberToStringIfDefined(query.blur),
        }),
        catMaybesDictionary,
    )();

export const buildImgixUrl = (url: string) =>
    pipe(
        serializeImgixUrlQueryParamValues,
        query => addQueryToUrl({ url })({ queryToAppend: query }),
    );
