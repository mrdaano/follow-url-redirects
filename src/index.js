const http = require('http');
const https = require('https')

function followRedirects(url, opts = {
    timeout: 10 * 1000,
    maxRedirects: 10
}) {
    if (!url || url.trim() === '' || !url.startsWith('http')) {
        throw new Error('Please enter a http or https url');
    }

    const isRedirect = code => [301, 302, 303, 307, 308].includes(code);

    return new Promise((resolve, reject) => {
        const redirectChain = [];
        let requestCounter = 0;
        function goToUrl(urlToGo) {
            try {
                urlToGo = new URL(urlToGo);
            } catch (error) {
                reject(new Error(`Invalid url: ${urlToGo}`));
                return;
            }

            const send = (urlToGo.protocol === 'https:' ? https : http).request;

            const requestData = {
                hostname: urlToGo.hostname,
                path: urlToGo.pathname,
                timeout: opts.timeout
            };

            if (urlToGo.port) {
                requestData.port = urlToGo.port;
            }

            const request = send(requestData);

            request.on('error', (err) => {
                request.abort();
                reject(new Error(`request to ${urlToGo} failed, reason: ${err.message}`));
            });

            request.on('response', (res) => {
                let { location } = res.headers;

                redirectChain.push({
                    url: urlToGo.toString(),
                    code: res.statusCode
                });

                if (location && isRedirect(res.statusCode)) {

                    if (requestCounter >= opts.maxRedirects) {
                        reject(new Error(`maximum redirect reached at: ${urlToGo}`));
                        return;
                    }

                    if (location.startsWith('/')) {
                        urlToGo.pathname = location;
                        location = urlToGo;
                    }

                    requestCounter++;
                    goToUrl(location);
                } else {
                    resolve(redirectChain);
                }
            })
            request.end();
        }

        goToUrl(url);
    });
}

module.exports = followRedirects;