// tslint:disable-next-line match-default-export-name
import { ParsedUrlQueryInput } from 'querystring';
import { addQueryToUrl } from 'url-transformers';
import { pickBy } from './helpers';
import { catMaybesDictionary, mapValueIfDefined } from './helpers/maybe';
import { pipe } from './helpers/pipe';

// Omit is only available from TS 3.5 onwards
// tslint:disable-next-line
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

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

export enum ImgixFormat {
    avif = 'avif',
    gif = 'gif',
    jp2 = 'jp2',
    jpg = 'jpg',
    json = 'json',
    jxr = 'jxr',
    pjpg = 'pjpg',
    mp4 = 'mp4',
    png = 'png',
    png8 = 'png8',
    png32 = 'png32',
    webm = 'webm',
    webp = 'webp',
    blurhash = 'blurhash',
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
    'min-h'?: number;
    fm?: ImgixFormat;
};

export type QueryParamsInput = Omit<ImgixUrlQueryParams, 'min-h'> & { minH?: number };

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

const mapToSerializedListValueIfDefined = mapValueIfDefined(serializeImgixUrlQueryParamListValue);

const serializeImgixUrlQueryParamValues = (query: QueryParamsInput): ParsedUrlQueryInput =>
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
            'min-h': query.minH,
            fm: query.fm,
        }),
        catMaybesDictionary,
    )({});

export const buildImgixUrl = (url: string) =>
    pipe(
        serializeImgixUrlQueryParamValues,
        query => addQueryToUrl(query)(url),
    );
