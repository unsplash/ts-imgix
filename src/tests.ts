import * as assert from 'assert';
import { buildImgixUrl } from './index';

assert.strictEqual(
    buildImgixUrl('https://foo.com')({
        auto: {
            format: true,
        },
        w: 300,
    }),
    'https://foo.com/?auto=format&w=300',
);

assert.strictEqual(
    buildImgixUrl('https://foo.com')({
        auto: {
            format: true,
        },
        w: 300,
        s: 'signature',
    }),
    'https://foo.com/?auto=format&w=300&s=signature',
);

assert.strictEqual(
    buildImgixUrl('https://foo.com', 'token')({
        auto: {
            format: true,
        },
        w: 300,
    }),
    'https://foo.com/?auto=format&w=300&s=d82d76f9f31379083b452f98bcd7f670',
);
