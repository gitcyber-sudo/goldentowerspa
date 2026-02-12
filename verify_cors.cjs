const https = require('https');

function checkFunction(slug) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'ivxmfztllyzwljaizhrk.supabase.co',
            path: `/functions/v1/${slug}`,
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id'
            }
        };

        const req = https.request(options, (res) => {
            const corsHeaders = res.headers['access-control-allow-headers'] || '';
            const success = corsHeaders.toLowerCase().includes('x-visitor-id');
            console.log(`[${slug}] Status: ${res.statusCode}`);
            console.log(`[${slug}] CORS Headers: ${corsHeaders}`);
            console.log(`[${slug}] Result: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
            resolve(success);
        });

        req.on('error', (err) => {
            console.log(`[${slug}] Error: ${err.message}`);
            resolve(false);
        });

        req.end();
    });
}

async function run() {
    const results = await Promise.all([
        checkFunction('update-therapist-password'),
        checkFunction('create-therapist')
    ]);

    if (results.every(r => r)) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

run();
