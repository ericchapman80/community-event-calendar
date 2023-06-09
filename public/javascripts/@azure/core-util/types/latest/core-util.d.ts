import { AbortSignalLike } from '@azure/abort-controller';

/**
 * Generates a SHA-256 hash.
 * @param content - The data to be included in the hash.
 * @param encoding - The textual encoding to use for the returned hash.
 */
export declare function computeSha256Hash(content: string, encoding: "base64" | "hex"): Promise<string>;

/**
 * Generates a SHA-256 HMAC signature.
 * @param key - The HMAC key represented as a base64 string, used to generate the cryptographic HMAC hash.
 * @param stringToSign - The data to be signed.
 * @param encoding - The textual encoding to use for the returned HMAC digest.
 */
export declare function computeSha256Hmac(key: string, stringToSign: string, encoding: "base64" | "hex"): Promise<string>;

/**
 * A wrapper for setTimeout that resolves a promise after timeInMs milliseconds.
 * @param timeInMs - The number of milliseconds to be delayed.
 * @param options - The options for delay - currently abort options
 * @returns Promise that is resolved after timeInMs
 */
export declare function delay(timeInMs: number, options?: DelayOptions): Promise<void>;

/**
 * Options for support abort functionality for the delay method
 */
export declare interface DelayOptions {
    /**
     * The abortSignal associated with containing operation.
     */
    abortSignal?: AbortSignalLike;
    /**
     * The abort error message associated with containing operation.
     */
    abortErrorMsg?: string;
}

/**
 * Given what is thought to be an error object, return the message if possible.
 * If the message is missing, returns a stringified version of the input.
 * @param e - Something thrown from a try block
 * @returns The error message or a string of the input
 */
export declare function getErrorMessage(e: unknown): string;

/**
 * Returns a random integer value between a lower and upper bound,
 * inclusive of both bounds.
 * Note that this uses Math.random and isn't secure. If you need to use
 * this for any kind of security purpose, find a better source of random.
 * @param min - The smallest integer value allowed.
 * @param max - The largest integer value allowed.
 */
export declare function getRandomIntegerInclusive(min: number, max: number): number;

/**
 * Helper TypeGuard that checks if something is defined or not.
 * @param thing - Anything
 */
export declare function isDefined<T>(thing: T | undefined | null): thing is T;

/**
 * Typeguard for an error object shape (has name and message)
 * @param e - Something caught by a catch clause.
 */
export declare function isError(e: unknown): e is Error;

/**
 * A constant that indicates whether the environment the code is running is Node.JS.
 */
export declare const isNode: boolean;

/**
 * Helper to determine when an input is a generic JS object.
 * @returns true when input is an object type that is not null, Array, RegExp, or Date.
 */
export declare function isObject(input: unknown): input is UnknownObject;

/**
 * Helper TypeGuard that checks if the input is an object with the specified properties.
 * @param thing - Anything.
 * @param properties - The name of the properties that should appear in the object.
 */
export declare function isObjectWithProperties<Thing, PropertyName extends string>(thing: Thing, properties: PropertyName[]): thing is Thing & Record<PropertyName, unknown>;

/**
 * Helper TypeGuard that checks if the input is an object with the specified property.
 * @param thing - Any object.
 * @param property - The name of the property that should appear in the object.
 */
export declare function objectHasProperty<Thing, PropertyName extends string>(thing: Thing, property: PropertyName): thing is Thing & Record<PropertyName, unknown>;

/**
 * A generic shape for a plain JS object.
 */
export declare type UnknownObject = {
    [s: string]: unknown;
};

export { }
