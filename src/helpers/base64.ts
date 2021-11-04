export interface Base64Uri {
    readonly __brand: unique symbol;
    value: string;
}

export const make =
    (encoder: (s: string) => string) =>
    (uri: string): Base64Uri => {
        const base64Uri = { value: encoder(uri) };
        return base64Uri as Base64Uri;
    };

export const toString = (base64Uri: Base64Uri): string => base64Uri.value as unknown as string;
