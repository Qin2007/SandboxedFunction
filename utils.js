// temporary
function isSafeBigInteger(n) {
    const typeis = typeOf(n);
    if (typeis === 'bigint' || typeis === 'number') {
        return (n <= BigInt(Number.MAX_SAFE_INTEGER) && n >= BigInt(Number.MIN_SAFE_INTEGER));
    }
    return false;
}

function Math_sign(n) {
    n = Number(n);
    if (n > 0) return +1;
    if (n < 0) return -1;
    if (Number.isNaN(n)) {
        return NaN;
    } else return 0;
}

function isNULL_or_undefined(any) {
    return any === null || any === undefined;
}

function isPrimitive(o) {
    if (o === null) return true;
    switch (typeof o) {
        case "object":
        case "function":
            return false;
        default:
            return true;
    }
}

function toPrimitive(O) {
    if (isPrimitive(O)) return O;
    let x = Object(O);
    let n = 0;
    while (!isPrimitive(x)) {
        const o = Object(x);

        if (Symbol.toPrimitive in o) {
            const result = o[Symbol.toPrimitive]('default');
            if (isPrimitive(result)) x = result;
        }

        if ('valueOf' in o) {
            const result = o.valueOf();
            if (isPrimitive(result)) x = result;
        }

        if ('toString' in o) {
            const result = o.toString();
            if (isPrimitive(result)) x = result;
        }
        if ((++n) > 800) throw new Error('precaution recursion');
    }
    return x;
}

function typeOf(o, mode = 0) {
    const t = typeof o;
    const m = Math.trunc(Number(mode));
    if (o === null) {
        return (!(m & typeOf.NULL_IsObject)) ? "NULL" : 'object';
    }
    if (m & typeOf.functionsAreObjects) {
        if (t === "function") {
            return "object";
        }
    }
    if (m & typeOf.checkArraySeperately) {
        if (Array.isArray(o)) {
            return "Array";
        }
    }
    if (m & typeOf.NAN_IS_NAN) {
        if (Number.isNaN(o)) {
            return "NaN";
        }
    }
    if (t === 'object') {
        if (m & typeOf.identifyRegExp) {
            if (o instanceof RegExp) return "RegExp";
        }
        if (m & typeOf.identifyDate) {
            if (o instanceof Date) return "Date";
        }
        if (m & typeOf.identifyPromise) {
            if (o instanceof Promise) return "Promise";
        }
        if (m & typeOf.identifyVia_constructor) {
            const value = o;
            if (value.constructor && value.constructor.name) {
                return value.constructor.name;
            }
        }
    }
    if (t === 'undefined' && m & typeOf.undefinedIsNULL) {
        return 'NULL';
    }
    return t;
}

typeOf.identifyVia_constructor = 64;
typeOf.checkArraySeperately = 1;
typeOf.functionsAreObjects = 2;
typeOf.undefinedIsNULL = 256;
typeOf.identifyPromise = 32;
typeOf.NULL_IsObject = 128;
typeOf.identifyRegExp = 8;
typeOf.identifyDate = 16;
typeOf.NAN_IS_NAN = 4;

function loose_equal(...parameters) {
    if (parameters.length === 0) throw new Error('loose_equal got zero parameters, what do you want to compare?');
    if (parameters.length !== 2) throw new Error(`loose_equal expects exactly 2 arguments, but received ${parameters.length}`);
    const a = parameters[0];
    const b = parameters[1];
    if (Number.isNaN(a) || Number.isNaN(b)) {
        // NaN must be not equal to anything. saves time
        return false;
    }
    if (typeOf(a) === typeOf(b)) {
        return a === b;
    } else if ((a === undefined || a === null) && (b === undefined || b === null)) {
        return true; // Both are undefined or null
    } else if ((a === undefined || a === null) !== (b === undefined || b === null)) {
        return false; // One is undefined or null, but the other is not
    } else {
        let primitiveA = a;
        let primitiveB = b;
        if (!isPrimitive(a)) {
            primitiveA = toPrimitive(a);
        }
        if (!isPrimitive(b)) {
            primitiveB = toPrimitive(b);
        }
        if (!(isPrimitive(primitiveA) && isPrimitive(primitiveB))) {
            throw new Error('either is not a primitive');
        } else if (typeOf(primitiveA) === typeOf(primitiveB)) {
            return primitiveA === primitiveB;
        } else if ((a === undefined || a === null) && (b === undefined || b === null)) {
            return true; // Both are undefined or null
        } else if ((a === undefined || a === null) !== (b === undefined || b === null)) {
            return false; // One is undefined or null, but the other is not
        } else {
            if (primitiveA === undefined || primitiveA === null) {
                return primitiveB === undefined || primitiveB === null;
            }
            if (((typeOf(primitiveA) === 'symbol') && !(typeOf(primitiveB) === 'symbol')) ||
                ((typeOf(primitiveB) === 'symbol') && !(typeOf(primitiveA) === 'symbol'))) {
                return false;// both are not Symbols while one is
            }
            if (((typeOf(primitiveA) === 'boolean') && !(typeOf(primitiveB) === 'boolean')) ||
                ((typeOf(primitiveB) === 'boolean') && !(typeOf(primitiveA) === 'boolean'))) {
                if (typeOf(primitiveA) === 'boolean') primitiveA = Number(primitiveA);
                if (typeOf(primitiveB) === 'boolean') primitiveB = Number(primitiveB);
                return loose_equal(primitiveA, primitiveB);
            }
            if ((typeOf(primitiveA) === "number" && typeOf(primitiveB) === "bigint") ||
                (typeOf(primitiveA) === "bigint" && typeOf(primitiveB) === "number")) {
                return `${primitiveA}` === `${primitiveB}`;
            }
            if ((typeOf(primitiveA) === "number" && typeOf(primitiveB) === "string") ||
                (typeOf(primitiveA) === "string" && typeOf(primitiveB) === "number")) {
                if (typeOf(primitiveA) === 'string') primitiveA = Number(primitiveA);
                if (typeOf(primitiveB) === 'string') primitiveB = Number(primitiveB);
                return primitiveA === primitiveB;
            }
            if ((typeOf(primitiveA) === "bigint" && typeOf(primitiveB) === "string") ||
                (typeOf(primitiveA) === "string" && typeOf(primitiveB) === "bigint")) {
                try {
                    if (typeOf(primitiveA) === 'string') primitiveA = BigInt(primitiveA);
                    if (typeOf(primitiveB) === 'string') primitiveB = BigInt(primitiveB);
                    return primitiveA === primitiveB;
                } catch {
                    return false;
                }
            }
            return loose_equal(primitiveA, primitiveB);
        }
    }
}

function normalize_newlines(string) {
    return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
