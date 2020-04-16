// tslint:disable-next-line match-default-export-name
import { createHash } from 'crypto';
import { ParsedUrlQueryInput } from 'querystring';
import * as urlHelpers from 'url';
import { addQueryToUrl } from 'url-transformers';
import { pickBy } from './helpers';
import { catMaybesDictionary, mapValueIfDefined } from './helpers/maybe';
import { pipe } from './helpers/pipe';

// https://docs.imgix.com/apis/url/size/fit
export enum ImgixFit {
    clamp = 'clamp',
    clip = 'clip',
    crop = 'crop',
    facearea = 'facearea',
    fill = 'fill',
    fillmax = 'fillmax',
    max = 'max',
    min = 'min',
    scale = 'scale',
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
export type ImgixAuto = Partial<Record<'compress' | 'enhance' | 'format' | 'redeye', boolean>>;

// https://docs.imgix.com/apis/url/format/ch
export type ImgixClientHints = Partial<Record<'width' | 'dpr' | 'saveData', boolean>>;

// https://docs.imgix.com/apis/url/size/ar
export type ImgixAspectRatio = {
    w: number;
    h: number;
};

// https://docs.imgix.com/apis/url/size/rect
export type ImgixRect = {
    x: number | 'left' | 'center' | 'right';
    y: number | 'top' | 'middle' | 'bottom';
    w: number;
    h: number;
};

// https://docs.imgix.com/apis/url
export type ImgixUrlQueryParams = {
    ar?: ImgixAspectRatio;
    auto?: ImgixAuto;
    q?: number;
    h?: number;
    w?: number;
    rect?: ImgixRect;
    fit?: ImgixFit;
    dpr?: number;
    crop?: ImgixCrop;
    bg?: string;
    ch?: ImgixClientHints;
    blur?: number;
    cs?: ImgixColorSpace;
    faceindex?: number;
    facepad?: number;
    s?: string;
};

const pickTrueInObject = <K extends string>(obj: Record<K, boolean>): Partial<Record<K, true>> =>
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
const addImgixUrlQueryParamSignature = (url: string, token?: string) => (
    query: ParsedUrlQueryInput,
) => {
    if (token === undefined || query.hasOwnProperty('s')) return query;

    const formattedQuery = urlHelpers.format({ query });
    const { pathname } = new urlHelpers.URL(url);

    // https://github.com/imgix/imgix-blueprint#securing-urls
    const signatureBase = token + pathname + formattedQuery;
    const signature = createHash('md5')
        .update(signatureBase)
        .digest('hex');

    return { ...query, s: signature };
};

const mapToSerializedListValueIfDefined = mapValueIfDefined(serializeImgixUrlQueryParamListValue);

const serializeImgixUrlQueryParamValues = (query: ImgixUrlQueryParams): ParsedUrlQueryInput =>
    pipe(
        (): Record<keyof ImgixUrlQueryParams, string | number | undefined> => ({
            ar: mapValueIfDefined((ar: ImgixAspectRatio) => `${ar.w}:${ar.h}`)(query.ar),
            dpr: query.dpr,
            auto: mapToSerializedListValueIfDefined(query.auto),
            fit: query.fit,
            w: query.w,
            h: query.h,
            rect: mapValueIfDefined((rect: ImgixRect) => `${rect.x},${rect.y},${rect.w},${rect.h}`)(
                query.rect,
            ),
            q: query.q,
            cs: query.cs,
            crop: mapToSerializedListValueIfDefined(query.crop),
            bg: query.bg,
            ch: mapToSerializedListValueIfDefined(query.ch),
            blur: query.blur,
            faceindex: query.faceindex,
            facepad: query.facepad,
            s: query.s,
        }),
        catMaybesDictionary,
    )({});

export const buildImgixUrl = (url: string, token?: string) =>
    pipe(
        serializeImgixUrlQueryParamValues,
        addImgixUrlQueryParamSignature(url, token),
        query => addQueryToUrl({ url })({ queryToAppend: query }),
    );
