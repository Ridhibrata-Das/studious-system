const translate = require('translate-google');

async function test() {
    try {
        console.log("Testing translate-google...");
        const res = await translate('Hello world', { to: 'hi' });
        console.log("Result:", res);
    } catch (e) {
        console.error("Translation failed:", e);
    }
}

test();
