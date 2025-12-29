export abstract class BaseVM {
  data: any | any;
  constructor(input: any | any[]) {
    this.data = input;
    return this;
  }

  build() {
    return Array.isArray(this.data) ? this.toVMArray(this.data): this.toVM(this.data);
  }

  abstract toVM<T>(input: T | T[]);

  construct<T>(input: T) {
    return this.toVM(input);
  }

  toVMArray<T>(input: T[]) {
    return input.map((v) => {
      return this.toVM(v);
    });
  }
}