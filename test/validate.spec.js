/* eslint-env mocha */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import schema from './resources/schema.json';
import * as validator from '../src/services/validator';

const { expect } = chai;

before(() => {
  chai.use(chaiAsPromised);
});

describe('pensieve validator', () => {
  describe('schemaValidate', () => {
    describe('string field', () => {
      it('should be rejected when provided with an invalid value', () => {
        const yaml = 'string field: 1234';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.be.rejected;
      });

      it('should not be rejected when provided with a valid value', () => {
        const yaml = 'string field: foobar';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.not.be.rejected;
      });
    });

    describe('number field', () => {
      it('should be rejected when provided with an invalid value', () => {
        const yaml = 'number field: foobar';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.be.rejected;
      });

      it('should not be rejected when provided with a valid value', () => {
        const yaml = 'number field: 1234';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.not.be.rejected;
      });
    });

    describe('boolean field', () => {
      it('should be rejected when provided with an invalid value', () => {
        const yaml = 'boolean field: foobar';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.be.rejected;
      });

      it('should not be rejected when provided with a valid value', () => {
        const yaml = 'boolean field: true';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.not.be.rejected;
      });
    });

    describe('date field', () => {
      it('should be rejected when provided with an invalid value', () => {
        const yaml = 'date field: foobar';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.be.rejected;
      });

      it('should not be rejected when provided with a valid value', () => {
        const yaml = 'date field: 6 Mar 2017 21:22:23 GMT';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.not.be.rejected;
      });
    });

    describe('semver-range field', () => {
      it('should be rejected when provided with an invalid value', () => {
        const yaml = 'semver-range field: 1234';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.be.rejected;
      });

      it('should not be rejected when provided with a valid value', () => {
        const yaml = 'semver-range field: > 1.22.0';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.not.be.rejected;
      });
    });

    describe('semver field', () => {
      it('should be rejected when provided with an invalid value', () => {
        const yaml = 'semver field: 1234';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.be.rejected;
      });

      it('should not be rejected when provided with a valid value', () => {
        const yaml = 'semver field: 1.22.0';
        return expect(validator.schemaValidate(schema, yaml)).to.eventually.not.be.rejected;
      });
    });
  });
});
