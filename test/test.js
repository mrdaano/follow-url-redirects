const expect = require('chai').expect;
const mockServer = require('./mockServer');

const followRedirects = require('../src/index');

const port = 13371
const server = new mockServer(port);

const baseUrl = `http://localhost:${port}/`;

before((done) => {
    server.start(done);
});

after((done) => {
    server.stop(done);
});

describe('follow-url-redirects', () => {
    it('Throws error when no url is given', () => {
        expect(followRedirects.bind(this, '')).to.throw(Error, 'Please enter a http or https url');
    });

    it('Throws error when a invalid url is given', () => {
        expect(followRedirects.bind(this, 'localhost')).to.throw(Error, 'Please enter a http or https url');
        expect(followRedirects.bind(this, 'ftp://localhost')).to.throw(Error, 'Please enter a http or https url');
    });

    it('Returns array with objects with baseurl and status code (link status code 200)', async () => {
        const url = `${baseUrl}hello`;
        const expected = [
            {
                url: url,
                code: 200
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow to the right url and returns the right object with a 301 redirect also a location url starting with / should work', async ()  => {
        const url = `${baseUrl}redirect/301`;
        const expected = [
            {
                url: url,
                code: 301
            },
            {
                url: `${baseUrl}hello`,
                code: 200
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });
});