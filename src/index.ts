// tslint:disable-next-line match-default-export-name
import { pipe, pipeWith } from 'pipe-ts';
import { addQueryToUrl } from 'url-transformers';
import { pickBy } from './helpers';
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

// https://docs.imgix.com/apis/url
export type ImgixUrlQueryParams = {
    ar?: ImgixAspectRatio;
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
    faceindex?: number;
    facepad?: number;
};
// TODO: remove cast and either make all functions allow partial, or all non-partial.
// const pickTrueInObject = <K extends string>(obj: Record<K, boolean>) =>
const pickTrueInObject = <K extends string>(
    obj: Partial<Record<K, boolean>>,
): Partial<Record<K, true>> =>
    pickBy(obj as Record<K, boolean>, (_key, value): value is true => value);
const pickTrueObjectKeys = pipe(
    pickTrueInObject,
    // This function has an overload which breaks type inference. See:
    // https://github.com/Microsoft/TypeScript/issues/29904#issuecomment-471105473. We workaround this
    // by wrapping the function.
    obj => Object.keys(obj),
);
const undefinedIfEmptyString = (str: string): string | undefined => (str === '' ? undefined : str);
const joinWithComma = (strs: string[]) => strs.join(',');
const serializeImgixUrlQueryParamListValue = pipe(
    pickTrueObjectKeys,
    // Needed to workaround https://github.com/microsoft/TypeScript/issues/29904#issuecomment-543785534
    value => value,
    joinWithComma,
    undefinedIfEmptyString,
);

const mapToSerializedListValueIfDefined = mapValueIfDefined(serializeImgixUrlQueryParamListValue);

// Note: if/when this PR is merged, this type will be available via the Node types.
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/33997
type ParsedUrlQueryInput = { [key: string]: unknown };

const serializeImgixUrlQueryParamValues = (query: ImgixUrlQueryParams): ParsedUrlQueryInput =>
    pipe(
        (): Record<keyof ImgixUrlQueryParams, string | number | undefined> => ({
            ar: pipeWith(query.ar, mapValueIfDefined(ar => `${ar.w}:${ar.h}`)),
            dpr: query.dpr,
            auto: mapToSerializedListValueIfDefined(query.auto),
            fit: query.fit,
            w: query.w,
            h: query.h,
            q: query.q,
            cs: query.cs,
            crop: mapToSerializedListValueIfDefined(query.crop),
            bg: query.bg,
            ch: mapToSerializedListValueIfDefined(query.ch),
            blur: query.blur,
            faceindex: query.faceindex,
            facepad: query.facepad,
        }),
        catMaybesDictionary,
    )();

export const buildImgixUrl = (url: string) =>
    pipe(
        serializeImgixUrlQueryParamValues,
        query => addQueryToUrl({ url })({ queryToAppend: query }),
    );
