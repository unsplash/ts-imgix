// tslint:disable-next-line match-default-export-name
import { ParsedUrlQueryInput } from 'querystring';
import { addQueryToUrl } from 'url-transformers';
import { pickBy } from './helpers';
import { flow } from './helpers/flow';
import { catMaybesDictionary, mapValueIfDefined } from './helpers/maybe';

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

// https://docs.imgix.com/apis/rendering/watermark/mark-align
export type ImgixMarkAlignBase = 'top' | 'middle' | 'bottom' | 'left' | 'center' | 'right';
// The api allows the user to combine the align values with a comma
export type ImgixMarkAlign = `${ImgixMarkAlignBase},${ImgixMarkAlignBase}` | ImgixMarkAlignBase;

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
    'mark-w'?: number;
    'mark-align'?: ImgixMarkAlign;
    'mark-pad'?: number;
    markY?: number;
    mark64?: string;
    markX?: number;
    blend64?: string;
    txt64?: string;
    'txt-color'?: string;
    'txt-size'?: number;
    'txt-align'?: ImgixMarkAlign;
    fm?: string;
    'txt-font'?: string;
    'blend-align'?: ImgixMarkAlign;
    'blend-mode'?: string;
    'blend-pad'?: number;
    'blend-alpha'?: number;
    mask?: string;
    blendW?: number;
    blendX?: number;
};

type KebabToCamelCase<S extends string> = S extends `${infer T}-${infer U}`
    ? `${T}${Capitalize<KebabToCamelCase<U>>}`
    : S;

export type QueryParamsInput = {
    [K in keyof ImgixUrlQueryParams as KebabToCamelCase<K>]: ImgixUrlQueryParams[K];
};

const pickTrueInObject = <K extends string>(obj: Record<K, boolean>): Partial<Record<K, true>> =>
    pickBy(obj, (_key, value): value is true => value);
const pickTrueObjectKeys = flow(
    pickTrueInObject,
    // tslint:disable-next-line no-unbound-method
    Object.keys,
);

const undefinedIfEmptyString = (str: string): string | undefined => (str === '' ? undefined : str);
const joinWithComma = (strs: string[]) => strs.join(',');
const serializeImgixUrlQueryParamListValue = flow(
    pickTrueObjectKeys,
    joinWithComma,
    undefinedIfEmptyString,
);

const mapToSerializedListValueIfDefined = mapValueIfDefined(serializeImgixUrlQueryParamListValue);

const serializeImgixUrlQueryParamValues = (query: QueryParamsInput): ParsedUrlQueryInput => {
    const imgixUrlQueryParams: Record<keyof ImgixUrlQueryParams, string | number | undefined> = {
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
        'mark-w': query.markW,
        'mark-align': query.markAlign,
        'mark-pad': query.markPad,
        markY: query.markY,
        mark64: query.mark64,
        blend64: query.blend64,
        txt64: query.txt64,
        'txt-color': query.txtColor,
        'txt-size': query.txtSize,
        'txt-align': query.txtAlign,
        fm: query.fm,
        'txt-font': query.txtFont,
        'blend-mode': query.blendMode,
        'blend-alpha': query.blendAlpha,
        'blend-pad': query.blendPad,
        blendW: query.blendW,
        mask: query.mask,
        'blend-align': query.blendAlign,
        blendX: query.blendX,
        markX: query.markX,
    };
    return catMaybesDictionary(imgixUrlQueryParams);
};

export const buildImgixUrl = (url: string) =>
    flow(serializeImgixUrlQueryParamValues, (query) => addQueryToUrl(query)(url));
