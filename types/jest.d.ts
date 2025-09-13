import "@testing-library/jest-dom";

declare global {
  const describe: typeof import("@jest/globals").describe;
  const it: typeof import("@jest/globals").it;
  const test: typeof import("@jest/globals").test;
  const expect: typeof import("@jest/globals").expect;
  const beforeEach: typeof import("@jest/globals").beforeEach;
  const afterEach: typeof import("@jest/globals").afterEach;
  const beforeAll: typeof import("@jest/globals").beforeAll;
  const afterAll: typeof import("@jest/globals").afterAll;
  const jest: typeof import("@jest/globals").jest;
  const fail: typeof import("@jest/globals").fail;

  namespace jest {
    interface MockedFunction<T extends (...args: any[]) => any> {
      (...args: Parameters<T>): ReturnType<T>;
      mockReturnValue(value: ReturnType<T>): this;
      mockResolvedValue(value: Awaited<ReturnType<T>>): this;
      mockRejectedValue(value: any): this;
      mockImplementation(fn: T): this;
      mockClear(): this;
      mockReset(): this;
      mockRestore(): this;
      getMockName(): string;
      mockName(name: string): this;
      mockReturnValueOnce(value: ReturnType<T>): this;
      mockResolvedValueOnce(value: Awaited<ReturnType<T>>): this;
      mockRejectedValueOnce(value: any): this;
      mockImplementationOnce(fn: T): this;
      mockCalls: Parameters<T>[];
      results: Array<{ type: "return" | "throw"; value: any }>;
      lastCall?: Parameters<T>;
      instances: Array<
        ReturnType<T> extends new (...args: any[]) => any
          ? InstanceType<ReturnType<T>>
          : any
      >;
    }

    type Mocked<T> = {
      [K in keyof T]: T[K] extends (...args: any[]) => any
        ? MockedFunction<T[K]>
        : T[K] extends new (...args: any[]) => any
          ? MockedClass<T[K]>
          : T[K];
    };

    interface MockedClass<T extends new (...args: any[]) => any> {
      new (...args: ConstructorParameters<T>): InstanceType<T>;
      (...args: ConstructorParameters<T>): InstanceType<T>;
      mock: {
        calls: ConstructorParameters<T>[];
        instances: InstanceType<T>[];
        results: Array<{ type: "return" | "throw"; value: any }>;
      };
    }
  }
}

export {};
