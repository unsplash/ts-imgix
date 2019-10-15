import * as assert from 'assert';
import { buildImgixUrl } from './index';

const baseUrl = 'https://foo.com';

assert.strictEqual(
    buildImgixUrl(baseUrl)({
        auto: {
            format: true,
        },
        w: 300,
    }),
    'https://foo.com/?auto=format&w=300',
);

const invalidRatios = ['foo', '1:', 'foo:1', '1:foo'];

const validRatios = ['1:1', '1.91:1', '1.91:1.28', '1:1.28546'];

assert.strictEqual(
    buildImgixUrl(baseUrl)({
        ar: '1:1',
    }),
    'https://foo.com/?ar=1%3A1',
);

invalidRatios.forEach(ratio => {
    assert.throws(() =>
        buildImgixUrl(baseUrl)({
            ar: ratio,
        }),
    );
});

validRatios.forEach(ratio => {
    assert.doesNotThrow(() =>
        buildImgixUrl(baseUrl)({
            ar: ratio,
        }),
    );
});
