import TypedError from 'typed-error';

export class PensieveLinterError extends TypedError {
  constructor(error) {
    super(error);
    this.mark = error.mark;
    this.reason = error.reason;
  }
}

export class PensieveValidationError extends TypedError {
  constructor(field, value, type) {
    super(
      `Invalid parameter: "${value}" is not a valid value for field "${field}", expected type: "${type}"`,
    );
  }
}
