/* eslint-env mocha */
const { expect } = require('chai');
const SchemaSieve = require('../src/services/filter');

const sieve = SchemaSieve();

describe('pensieve validator', () => {
  describe('schemaValidate', () => {
    /**
     * Boolean
     */
    describe('Boolean field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Boolean', 1234)).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Boolean', false)).to.be.true);
    });

    /**
     * Case Insensitive Text
     */
    describe('Case Insensitive Text field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Case Insensitive Text', 1234)).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Case Insensitive Text', 'foobar')).to.be.true);
    });

    /**
     * Date Time
     */
    describe('Date Time field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Date Time', 'foobar')).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Date Time', '6 Mar 2017 21:22:23 GMT')).to.be.true);
    });

    /**
     * Date
     */
    describe('Date field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Date', 'foobar')).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Date', '6 Mar 2017 21:22:23 GMT')).to.be.true);
    });

    /**
     * Integer
     */
    describe('Integer field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Integer', 'foobar')).to.be.false);

      it('should return false when provided with a float value', () =>
        expect(sieve.validate('Integer', 1.234)).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Integer', 1234)).to.be.true);
    });

    /**
     * Real
     */
    describe('Real field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Real', 'foobar')).to.be.false);

      it('should return true when provided with an integer value', () =>
        expect(sieve.validate('Real', 1234)).to.be.true);

      it('should return true when provided with a float value', () =>
        expect(sieve.validate('Real', 1.234)).to.be.true);
    });

    /**
     * Short Text
     */
    describe('Short Text field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Short Text', 1234)).to.be.false);

      it('should return false when provided with a string value longer than 255 characters', () =>
        expect(sieve.validate('Short Text', Array(50).join('foobar'))).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Short Text', 'foobar')).to.be.true);
    });

    /**
     * Text
     */
    describe('Text field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Text', 1234)).to.be.false);

      it('should return true when provided with a string value longer than 255 characters', () =>
        expect(sieve.validate('Text', Array(50).join('foobar'))).to.be.true);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Text', 'foobar')).to.be.true);
    });

    /**
     * Time
     */
    describe('Time field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('Time', 'foobar')).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('Time', '6 Mar 2017 21:22:23 GMT')).to.be.true);
    });

    /**
     * semver-range
     */
    describe('semver-range field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('semver-range', 1234)).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('semver-range', '> 1.5.0')).to.be.true);
    });

    /**
     * semver
     */
    describe('semver field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('semver', 1234)).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('semver', '1.5.0')).to.be.true);
    });

    /**
     * Legacy aliases
     */
    describe('string field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('string', 1234)).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('string', 'foobar')).to.be.true);
    });

    describe('number field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('number', 'foobar')).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('number', 1234)).to.be.true);
    });

    describe('boolean field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('boolean', 'foobar')).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('boolean', true)).to.be.true);
    });

    describe('date field', () => {
      it('should return false when provided with an invalid value', () =>
        expect(sieve.validate('date', 'foobar')).to.be.false);

      it('should return true when provided with a valid value', () =>
        expect(sieve.validate('date', '6 Mar 2017 21:22:23 GMT')).to.be.true);
    });
  });
});
