import * as assert from 'assert';
import { buildImgixUrl } from './index';

assert.strictEqual(
    buildImgixUrl('https://foo.com')({
        auto: {
            format: true,
        },
        w: 300,
        minH: 300,
    }),
    'https://foo.com/?auto=format&w=300&min-h=300',
);
