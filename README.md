# **ts-imgix**

Strongly-typed imgix URL builder function, `buildImgixUrl`.

**buildImgixUrl** is a strongly-typed Imgix URL builder function that allows you to easily generate Imgix URLs with type checking and validation.

Imgix is an image processing service that allows you to manipulate and optimize images on-the-fly. With Imgix, you can resize, crop, adjust color, and apply filters to images using a simple URL-based API.

buildImgixUrl makes it easy to generate Imgix URLs with type checking and validation. It takes a strongly-typed configuration object that defines the parameters for the Imgix URL and returns a string containing the complete Imgix URL.

```ts
import * as assert from 'assert';
import { buildImgixUrl } from 'ts-imgix';

assert.strictEqual(
    buildImgixUrl('https://foo.com')({
        auto: {
            format: true,
        },
        w: 300,
    }),
    'https://foo.com/?auto=format&w=300',
);
```

![](./demo1.png)
![](./demo2.png)
![](./demo3.png)

## **Installation**

```sh
yarn add ts-imgix
npm install ts-imgix
```

## **Development**

```
yarn
npm run start
```

## **Supported parameters**

The buildImgixUrl function supports the following parameters:

- **host** (string, required): The imgix domain name to use for the image.
- **path** (string, required): The path to the image file.
- **width** (number): The width of the image.
- **height** (number): The height of the image.
- **format** (string): The file format to use for the image. Valid values are **jpg, jpeg, png, gif, webp, heif,** and **avif**.
- **quality** (number): The quality of the image, expressed as a percentage.
- **auto** (string): The automatic image processing to apply to the image. Valid values are **compress, format, enhance, redeye, rotate, flip, sharpen, blur, mono, sepia, negative, vibrance, pixelate,** and **crop**.
- **fit** (string): The type of cropping to use for the image. Valid values are **crop, clip, clamp, facearea, fill, max,** and **min**.
- **crop** (string): The crop region of the image. This parameter is required when the fit parameter is set to **crop**.

## **Error handling**

The `buildImgixUrl` function uses TypeScript to enforce parameter types, which helps to catch errors at compile time. If an invalid parameter is provided, the function will throw an error.

## **Conclusion**

The `buildImgixUrl` function is a strongly-typed URL builder that makes it easy to generate imgix URLs with the desired parameters. By using TypeScript to enforce parameter types, the function helps to catch errors at compile time, which can save time and improve code quality.