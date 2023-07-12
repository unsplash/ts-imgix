// tslint:disable-next-line match-default-export-name
import { ParsedUrlQueryInput } from 'querystring';
import { addQueryToUrl } from 'url-transformers';
import { pickBy } from './helpers';
import { flow } from './helpers/flow';
import { catMaybesDictionary, mapValueIfDefined } from './helpers/maybe';

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

export enum ImgixBlendMode {
    normal = 'normal',
    darken = 'darken',
    multiply = 'multiply',
    burn = 'burn',
    lighten = 'lighten',
    screen = 'screen',
    dodge = 'dodge',
    overlay = 'overlay',
    softlight = 'softlight',
    hardlight = 'hardlight',
    difference = 'difference',
    exclusion = 'exclusion',
    color = 'color',
    hue = 'hue',
    saturation = 'saturation',
    luminosity = 'luminosity',
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

type Combinations<T extends string, U extends string = T> = T extends String
    ? T | `${T},${Exclude<U, T>}`
    : never;

// https://docs.imgix.com/apis/rendering/watermark/mark-align
export type ImgixMarkAlignBase = 'top' | 'middle' | 'bottom' | 'left' | 'center' | 'right';
// The api allows the user to combine the align values with a comma
type ImgixMarkAlign = Combinations<ImgixMarkAlignBase>;

export enum ImgixTxtClip {
    start = 'start',
    middle = 'middle',
    end = 'end',
    ellipsis = 'ellipsis',
}

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
    'fp-z'?: number;
    'min-h'?: number;
    'mark-w'?: number;
    'mark-align'?: ImgixMarkAlign;
    'mark-pad'?: number;
    'mark-y'?: number;
    mark64?: string;
    mark?: string;
    'mark-x'?: number;
    blend64?: string;
    blend?: string;
    'txt-align'?: ImgixMarkAlign;
    'txt-clip'?: ImgixTxtClip;
    'txt-color'?: string;
    'txt-fit'?: 'max';
    'txt-font'?: string;
    'txt-lig'?: 0 | 1 | 2;
    'txt-line-color'?: string;
    'txt-line'?: number;
    'txt-pad'?: number;
    'txt-shad'?: number;
    'txt-size'?: number;
    'txt-width'?: number;
    'txt-x'?: number;
    'txt-y'?: number;
    txt?: string;
    txt64?: string;
    'blend-align'?: ImgixMarkAlign;
    'blend-mode'?: ImgixBlendMode;
    'blend-pad'?: number;
    'blend-alpha'?: number;
    mask?: string;
    'blend-w'?: number;
    'blend-x'?: number;
    'blend-y'?: number;
    fm?: ImgixFormat;
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
        'fp-z': query['fpZ'],
        'min-h': query.minH,
        'mark-w': query.markW,
        'mark-align': query.markAlign,
        'mark-pad': query.markPad,
        'mark-y': query.markY,
        mark64: query.mark64,
        blend64: query.blend64,
        txt64: query.txt64,
        'txt-color': query.txtColor,
        'txt-size': query.txtSize,
        'txt-align': query.txtAlign,
        'txt-pad': query.txtPad,
        'txt-width': query.txtWidth,
        'txt-clip': query.txtClip,
        'txt-lig': query.txtLig,
        'txt-line': query.txtLine,
        'txt-line-color': query.txtLineColor,
        'txt-shad': query.txtShad,
        'txt-fit': query.txtFit,
        'txt-x': query.txtX,
        'txt-y': query.txtY,
        fm: query.fm,
        'txt-font': query.txtFont,
        'blend-mode': query.blendMode,
        'blend-alpha': query.blendAlpha,
        'blend-pad': query.blendPad,
        'blend-w': query.blendW,
        mask: query.mask,
        'blend-align': query.blendAlign,
        'blend-x': query.blendX,
        'blend-y': query.blendY,
        'mark-x': query.markX,
        mark: query.mark,
        blend: query.blend,
        txt: query.txt,
    };
    return catMaybesDictionary(imgixUrlQueryParams);
};

export const buildImgixUrl = (url: string) =>
    flow(serializeImgixUrlQueryParamValues, (query) => addQueryToUrl(query)(url));
