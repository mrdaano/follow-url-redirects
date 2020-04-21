const expect = require('chai').expect;

const followRedirects = require('../src/index');

describe('follow-url-redirects', () => {
    it('Returns error when no url is given', () => {
        expect(followRedirects.bind(this, '')).to.throw(Error, 'Please enter a http or https url');
    });

    it('Returns error when a invalid url is given', () => {
        // expect(followRedirects('localhost')).to.throw(new Error('Invalid url: localhost'));
        expect(followRedirects('ftp://localhost')).to.throw(Error, 'Please enter a http or https url');
    });
});