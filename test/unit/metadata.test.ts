import * as assert from 'assert';

suite('Initializr Metadata Unit Tests', () => {
    test('Basic sanity test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});
