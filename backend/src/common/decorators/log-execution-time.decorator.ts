export function LogExecutionTime<T = any>(): MethodDecorator {
  return function (
    target: ObjectConstructor,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (...args: any[]) => any;

    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name;
      const methodName = String(propertyKey);
      const start = Date.now();

      try {
        const result = (await originalMethod.apply(this, args)) as T;
        const duration = Date.now() - start;
        console.log(`[${className}.${methodName}] executed in ${duration}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(
          `[${className}.${methodName}] failed after ${duration}ms`,
        );
        throw error;
      }
    };

    return descriptor;
  };
}
