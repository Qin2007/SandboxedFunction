//deepproxy.js
function DeepProxy(target) {
    if (new.target) {
        throw new TypeError("DeepProxy must be invoked without 'new'");
    }
    target = Object(target);
    const imaginary = new Map(); // Use a Map to handle objects with symbolic keys
    const handler = {
        get(target, prop, receiver) {
            if (imaginary.has(prop)) {
                return imaginary.get(prop);
            }
            const value = Reflect.get(target, prop, receiver);
            // Wrap nested objects in a new DeepProxy
            if (typeOf(value, typeOf.functionsAreObjects) === 'object') {
                return DeepProxy(value); // Recursive wrapping
            }
            return value;
        },
        set(target, prop, value, receiver) {
            imaginary.set(prop, value); // Store in the imaginary object
            return true;
        },
        has(target, prop) {
            return imaginary.has(prop) || Reflect.has(target, prop);
        },
        deleteProperty(target, prop) {
            if (imaginary.has(prop)) {
                imaginary.delete(prop);
                return true;
            }
            return false;
        },
        ownKeys(target) {
            return [...new Set([...Reflect.ownKeys(target), ...imaginary.keys()])];
        },
        getOwnPropertyDescriptor(target, prop) {
            if (imaginary.has(prop)) {
                return {
                    configurable: true,
                    enumerable: true,
                    value: imaginary.get(prop),
                    writable: true,
                };
            }
            return Reflect.getOwnPropertyDescriptor(target, prop);
        },
    };

    return new Proxy(target, handler);
}

// function DeepProxy(target) {
//     if (!!new.target) {
//         //called without new
//         throw new TypeError("DeepProxy must be invoked without 'new'");
//     }
//     const imaginarySymbol = Symbol('imaginary');
//     const imaginary = {};
//     const handler = {
//         get(target, prop, receiver) {
//             // Check if the property exists in the imaginary object first
//             if (prop in imaginary) {
//                 return imaginary[prop];
//             }
//             // Fall back to the target object
//             return Reflect.get(target, prop, receiver);
//         },
//         set(target, prop, value, receiver) {
//             // Modify only the imaginary object
//             imaginary[prop] = value;
//             return true; // Indicate success
//         },
//         has(target, prop) {
//             // Check both imaginary and target for property existence
//             return prop in imaginary || Reflect.has(target, prop);
//         },
//         deleteProperty(target, prop) {
//             // Delete property only from the imaginary object
//             if (prop in imaginary) {
//                 delete imaginary[prop];
//                 return true;
//             }
//             return false;
//         },
//     };
//     const proxy = new Proxy(target, {
//         get(target, prop, receiver) {
//             const value = Reflect.get(target, prop, receiver);
//             // If the value is an object, wrap it in a Proxy
//             if (typeof value === "object" && value !== null) {
//                 return new DeepProxy(value, handler);
//             }
//             return value;
//         },
//         ...handler,
//     });
//     proxy[imaginarySymbol] = imaginary;
//     return proxy;
// }

// function DeepProxy(target) {
//     if (!new.target) {
//         //called without new
//         throw new TypeError("DeepProxy must be invoked with 'new'");
//     }
//     const imaginary = this.imaginary = {};
//     this.proxy = new Proxy(target, {
//         get(target, prop, receiver) {
//             // Check if the property exists in the imaginary object first
//             if (prop in imaginary) {
//                 return imaginary[prop];
//             }
//             // Fall back to the target object
//             return Reflect.get(target, prop, receiver);
//         },
//         set(target, prop, value, receiver) {
//             // Modify only the imaginary object
//             imaginary[prop] = value;
//             return true; // Indicate success
//         },
//         has(target, prop) {
//             // Check both imaginary and target for property existence
//             return prop in imaginary || Reflect.has(target, prop);
//         },
//         deleteProperty(target, prop) {
//             // Delete property only from the imaginary object
//             if (prop in imaginary) {
//                 delete imaginary[prop];
//                 return true;
//             }
//             return false;
//         },
//     });
// }
