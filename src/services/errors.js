import TypedError from 'typed-error';

export class PensieveLinterError extends TypedError {
  constructor(error) {
    super(error);
    this.mark = error.mark;
    this.reason = error.reason;
  }
}
