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
    if ((m & typeOf.functionsAreObjects) === typeOf.functionsAreObjects) {
        if (t === "function") {
            return "object";
        }
    }
    if ((m & typeOf.checkArraySeperately) === typeOf.checkArraySeperately) {
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

function loose_equal(a, b) {
    //(...parameters)
    const parameters_length = arguments.length;
    if (parameters_length === 0) throw new Error('loose_equal got zero parameters, what do you want to compare?');
    if (parameters_length !== 2) throw new Error(`loose_equal expects exactly 2 arguments, but received ${parameters_length}`);
    // const a = parameters[0];
    // const b = parameters[1];
    if (Number.isNaN(a) || Number.isNaN(b)) {
        // NaN must be not equal to anything. saves time
        return false;
    }
    if (typeOf(a) === typeOf(b)) {
        return a === b;
    } else if ((a === undefined || a === null) === (b === undefined || b === null)) {
        return true; // Both are undefined or null
    } else if ((a === undefined || a === null) !== (b === undefined || b === null)) {
        return false; // One is undefined or null, but the other is not
    } else {
        let primitiveA = a, primitiveB = b;
        if (!isPrimitive(a)) {
            primitiveA = toPrimitive(a);
        }
        if (!isPrimitive(b)) {
            primitiveB = toPrimitive(b);
        }
        const typeis_primitiveA = typeOf(primitiveA), typeis_primitiveB = typeOf(primitiveB);
        if (!(isPrimitive(primitiveA) && isPrimitive(primitiveB))) {
            throw new Error('either is not a primitive');
        } else if (typeis_primitiveA === typeis_primitiveB) {
            return primitiveA === primitiveB;
        } else if ((a === undefined || a === null) === (b === undefined || b === null)) {
            return true; // Both are undefined or null
        } else if ((a === undefined || a === null) !== (b === undefined || b === null)) {
            return false; // One is undefined or null, but the other is not
        } else {
            /* if (primitiveA === undefined || primitiveA === null) {
            return primitiveB === undefined || primitiveB === null; }*/
            if (((typeis_primitiveA === 'symbol') && !(typeis_primitiveB === 'symbol')) ||
                ((typeis_primitiveB === 'symbol') && !(typeis_primitiveA === 'symbol'))) {
                return false;// both are not Symbols while one is
            }
            if (((typeis_primitiveA === 'boolean') && !(typeis_primitiveB === 'boolean')) ||
                ((typeis_primitiveB === 'boolean') && !(typeis_primitiveA === 'boolean'))) {
                if (typeis_primitiveA === 'boolean') primitiveA = Number(primitiveA);
                if (typeis_primitiveB === 'boolean') primitiveB = Number(primitiveB);
                return loose_equal(primitiveA, primitiveB);
            }
            if ((typeis_primitiveA === "number" && typeis_primitiveB === "bigint") ||
                (typeis_primitiveA === "bigint" && typeis_primitiveB === "number")) {
                return `${primitiveA}` === `${primitiveB}`;
            }
            if ((typeis_primitiveA === "number" && typeis_primitiveB === "string") ||
                (typeis_primitiveA === "string" && typeis_primitiveB === "number")) {
                if (typeis_primitiveA === 'string') primitiveA = Number(primitiveA);
                if (typeis_primitiveB === 'string') primitiveB = Number(primitiveB);
                return primitiveA === primitiveB;
            }
            if ((typeis_primitiveA === "bigint" && typeis_primitiveB === "string") ||
                (typeis_primitiveA === "string" && typeis_primitiveB === "bigint")) {
                try {
                    if (typeis_primitiveA === 'string') primitiveA = BigInt(primitiveA);
                    if (typeis_primitiveB === 'string') primitiveB = BigInt(primitiveB);
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

function calculateExpression(expressionArray, throwIfEmpty = 0, selfObject = undefined) {
    if (!Array.isArray(expressionArray)) {
        throw new TypeError('expressionArray must be an array');
    }
    if (!(expressionArray.length > 0)) {
        if (throwIfEmpty & calculateExpression.throwIfEmpty) {
            throw new Error('calculateExpression was send an empty expressionArray');
        } else if (throwIfEmpty & calculateExpression.warnIfEmpty) {
            console.warn('calculateExpression was send an empty expressionArray');
        }// if (throwIfEmpty & calculateExpression.undefinedIfEmpty) // do nothing
        return {type: 'undefined', 'value': undefined};
    } else if (!expressionArray.every(function (element) {
        return element !== undefined && Object(element)['type'] !== 'undefined';
    })) {
        if (throwIfEmpty & calculateExpression.throwIfEmpty) {
            throw new Error('calculateExpression was send an empty (or an array with only undefined) expressionArray');
        } else if (throwIfEmpty & calculateExpression.warnIfEmpty) {
            console.warn('calculateExpression was send an empty (or an array with only undefined) expressionArray');
        }
        if (!(throwIfEmpty & calculateExpression.allowOnlyUndefined)) {
            return {type: 'undefined', 'value': undefined};
        }
    }


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
            } else if (L.type === R.type && L.type === 'string') {
                expressionArray_[index - 1] = {
                    type: 'string', value: (function () {
                        switch (operator) {
                            case'+':
                                return L['value'] + R['value'];
                            case'-':
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

    let index;
    while ((index = expressionArray.findIndex(function (element) {
        return Array.isArray(element);
    })) >= 0) {
        expressionArray[index] = this.calculateExpression(expressionArray[index], throwIfEmpty);
    }
    // functionCalls.js
    while ((index = expressionArray.findIndex(function (element) {
        return Object(element)['type'] === 'functionCall';
    })) >= 0) {
        let theActualFunction = expressionArray[index];
        if (typeOf(theActualFunction, typeOf.functionsAreObjects) === 'object') {
            theActualFunction = theActualFunction.value;//.target;
            const parameters = expressionArray[index].parameters;
            const theArguments = {length: parameters.length, parameters: parameters};
            const insertion = theArguments.length === 0 ? {length: 0, parameters: []} : {
                parameters: [calculateExpression([...expressionArray[index].parameters], throwIfEmpty)],
            };
            insertion.length = insertion.parameters.length;
            if ((typeof SandboxedFunction) !== 'undefined' && theActualFunction instanceof SandboxedFunction) {
                throw new TypeError('SandboxedFunction not supported');
            } else if ((typeof SandboxedFunctionPHP) !== 'undefined' && theActualFunction instanceof SandboxedFunctionPHP) {
                throw new TypeError('SandboxedFunctionPHP not supported');
            } else if ((typeof __SandBoxedBuiltInFunction) !== 'undefined' && (theActualFunction instanceof __SandBoxedBuiltInFunction)) {
                expressionArray[index] = theActualFunction.callMe(insertion, selfObject);
            } else if (theActualFunction instanceof Function) {
                expressionArray[index] = theActualFunction(insertion, selfObject);
            } else {
                console.error(theActualFunction);
                throw new Error(`${Object(theActualFunction).constructor.name} is not a function`);
            }
        } else {
            console.error(theActualFunction);
            throw new Error(`expressionArray[${index}] is not a present`);
        }
    }
    // expressionArray = expressionArray.filter(function (element) {return element !== undefined && Object(element)['type'] !== 'undefined';});
    // powers and modulos
    expressionArray = make_2side_calculation(['**', '%'], expressionArray);
    // division and multiplecation
    expressionArray = make_2side_calculation(['/', '*'], expressionArray);
    // addition and finally subtraction
    expressionArray = make_2side_calculation(['+', '-'], expressionArray);
    expressionArray = expressionArray.filter(function (element) {
        return Object(element)['type'] !== 'accessChain';
    });
    if (expressionArray.length > 0) {
        return expressionArray[0];
    } else {
        return {type: 'undefined', 'value': undefined};
    }
}

calculateExpression.throwIfEmpty = 1;
calculateExpression.warnIfEmpty = 2;
calculateExpression.undefinedIfEmpty = 0;
calculateExpression.allowOnlyUndefined = 4;

function ObjectBufferPHP() {
    if (!new.target) {
        throw new Error('__ObjectBufferPHP must be invoked with \'new\'');
    }
    this.array = [];
    this.bufferListeners = [];
}

ObjectBufferPHP.prototype.append = function (string) {
    const buffer = String(string);
    this.array.push(buffer);
    for (const bufferElement of this.bufferListeners) {
        bufferElement(buffer);
    }
};

ObjectBufferPHP.prototype.toString = function () {
    return this.array.join('\n\n');
};
ObjectBufferPHP.prototype.addBufferListener = function (listener) {
    this.bufferListeners.push(listener);
    return this;
};
ObjectBufferPHP.prototype.removeBufferListener = function (listener) {
    let found = false;
    this.bufferListeners = this.bufferListeners.filter(function (function1) {
        return found = (function1 !== listener) || found;
    });
    return found;
};

/*function __StringOrSymbol(any) {
    if ((typeof any) === 'symbol') {
        return any;
    }
    return String(any);
}

const resolveReference = function (baseObject, propertyChain) {
    let current = baseObject;
    if (!Array.isArray(propertyChain) || propertyChain.length === 0) {
        throw new Error("Keys must be a non-empty array of strings.");
    }
    const chain = propertyChain.map(__StringOrSymbol);
    for (let prop of chain) {
        const key = prop;
        if (isNULL_or_undefined(current) || !(key in current)) {
            console.warn(`Property '${key}' does not exist on ${chain.join('.')},`, current);
            //throw new ReferenceError(`Property '${key}' does not exist on ${current}`);
            return undefined;
        }
        current = current[key];
    }
    return current;
};

const setProperty = function (obj, keys, value) {
    if (!Array.isArray(keys) || keys.length === 0) {
        throw new Error("Keys must be a non-empty array of strings.");
    }

    let target = obj;
    keys = keys.map(__StringOrSymbol);
    // Traverse through the keys except the last one
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        // Ensure the key exists in the object, or create an empty object
        const typeIs = typeOf(target[key], typeOf.undefinedIsNULL | typeOf.functionsAreObjects);
        switch (typeIs) {
            case"NULL":
                throw new Error('null is found');
        }

        target = target[key];
    }

    // Set the value to the last key
    const lastKey = keys[keys.length - 1];
    target[lastKey] = value;
};*/
class SymbolRegistry {
    constructor() {
        this.symbols = {};
    }

    register(name) {
        if (name === undefined) throw new Error('undefined as value is explicitly disallowed');
        name = String(name);
        return this.symbols[name] ?? Symbol(name);
    }

    has(name) {
        return Boolean(this.symbols[String(name)]);
    }

    deleteSymbol(name) {
        if (name === undefined) throw new Error('undefined as value is explicitly disallowed');
        name = String(name);
        if (this.has(name)) {
            delete this.symbols[name];
            return true;
        } else {
            return false;
        }
    }
}
