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

function __array_append(array, ...rest) {
    if (!Array.isArray(array)) array = [array];
    array.push(...rest);
    return array;
}

function parseNumber(string, mode = 0) {
    const step1 = String(string).replace(/\s/g, '');
    const Strict = Number(mode);
    let sign = '+';
    if (step1[0] === '-') sign = '-';
    let step2;
    if (/^[\-+]/.test(step1[0])) {
        step2 = step1.slice(1);
    } else {
        step2 = step1;
    }
    let RTValue;// Handle "0"-prefixed numbers (potential octals)
    if (/^0[0-7]*$/.test(step2)) {
        const message = `"0"-prefixed octal literals are deprecated; use the "0o" prefix instead`;
        if (Strict & parseNumber.disallowOctalsWithoutO) {
            throw new SyntaxError(message);
        }
        console.warn(message);
        RTValue = parseInt(`${sign}${step2}`, 8);
    } else if (/^0[oO][0-7]+$/.test(step2)) {
        RTValue = parseInt(`${sign}${step2}`, 8);
    } else if (/^0[xX][0-9a-fA-F]+$/.test(step2)) {
        // Handle hex literals
        RTValue = parseInt(`${sign}${step2}`, 16);
    } else if (/^0[bB][01]+$/.test(step2)) {
        // Handle binary literals
        RTValue = parseInt(`${sign}${step2}`, 2);
    } else if (!(Strict & parseNumber.disallowElse)) {
        // Handle standard decimal or invalid strings
        RTValue = Number(`${sign}${step2}`);
    }
    if ((Strict & parseNumber.disallowNaN) && Number.isNaN(RTValue)) {
        throw new SyntaxError(`${step1} cannot be converted to a Number`);
    }
    return Number(RTValue);
}

parseNumber.disallowElse = 4;
parseNumber.disallowOctalsWithoutO = 1;
parseNumber.disallowNaN = 2;

function assert(statement, assertionId = 'unknown assertion') {
    if (!Boolean(statement)) {
        throw new Error(`(${String(assertionId)}) wasn't truthy`);
    }
    return statement;
}

function calculateExpression(expressionArray) {
    function make_2side_calculation(operators, expressionArray_) {
        let index, operator;
        while ((index = expressionArray_.findIndex(function (element) {
            const object = Object(element);
            if (object['type'] === 'operator') {
                const inArray = operators.includes(object['value']);
                if (inArray) operator = object['value'];
                return inArray;
            } else {
                return false;
            }
        })) >= 0) {
            const H = expressionArray_[index];
            const L = expressionArray_[index - 1];
            const R = expressionArray_[index + 1];
            assert(typeOf(L) === 'object', 'L is Object');
            assert(typeOf(H) === 'object', 'H is Object');
            assert(typeOf(R) === 'object', 'R is Object');
            if (L.type === 'operator' || R.type === 'operator') {
                throw new SyntaxError('Operator found where value was expected.');
            }
            if (H.type !== 'operator') {
                console.error(L, H, R);
                throw new SyntaxError('non-Operator found where Operator was expected.');
            }
            if (L.type === R.type && L.type === 'number') {
                expressionArray_[index - 1] = {
                    type: 'number', value: (function () {
                        switch (operator) {
                            case'/':
                                return L['value'] / R['value'];
                            case'*':
                                return L['value'] * R['value'];
                            case'**':
                                return L['value'] ** R['value'];
                            case'+':
                                return L['value'] + R['value'];
                            case'-':
                                return L['value'] - R['value'];
                            case'%':
                                return L['value'] & R['value'];
                            default:
                        }
                        throw new Error(`operator "${operator}" not supported`);
                    })(),
                };
                expressionArray_[index + 1] = undefined;
                expressionArray_[index] = undefined;
                expressionArray_ = expressionArray_.filter(function (element) {
                    return element !== undefined;
                });
            } else {
                throw new TypeError(`L.type{${L.type}}, R.type{${R.type}}; currently only numbers are supported`);
            }
        }
        return expressionArray_.filter(function (element) {
            return element !== undefined;
        });
    }

    let index = expressionArray.findIndex(function (element) {
        return Array.isArray(element);
    });
    if (index >= 0) {
        expressionArray[index] = this.calculateExpression(expressionArray[index]);
    }
    expressionArray = make_2side_calculation(['**','%'], expressionArray);
    // division and multiplecation
    expressionArray = make_2side_calculation(['/','*'], expressionArray);
    // addition and finally subtraction
    expressionArray = make_2side_calculation(['+', '-'], expressionArray);
    return expressionArray[0];
}