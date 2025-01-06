// javascript
function SandboxedFunction(javascript, globalObject) {
    let __tokens;
    if ('tokens' in Object(javascript)) {
        __tokens = javascript.tokens;
    } else {
        __tokens = SandboxedFunction.prototype.__tokenize(javascript);
    }
    const functions = [];
    let context = __createFunctionTemplate();
    const assert = function (statement, assertionId = 'unknown assertion') {
        if (!Boolean(statement)) {
            throw new Error(`(${String(assertionId)}) wasn't truthy`);
        }
        return statement;
    }

    const defaultObject = {
        console: {
            log: function (...rest) {
                return console.log(rest);
            }
        },
        Math: {
            trunc: function (...rest) {
                return Math.trunc(rest);
            }
        },
        Number: {
            [SandboxedFunction.prototype.__call]: function (toNumber) {
                return Number(toNumber);
            },
        },
        Date: {
            [SandboxedFunction.prototype.__callsp](object) {
                // object.length;
                // noinspection JSCheckFunctionSignatures
                return new Date(...object.parameters);
            }
        },
        versionId: '0.0.42',
    };
    defaultObject.this = defaultObject;
    defaultObject.globalThis = defaultObject;
    const globalObject_ = DeepProxy(globalObject ?? defaultObject);

    const hoistedVars = [];
    const tokensNoFunction = [];
    for (const token of __tokens) {
        if (context.stage === '404') {
            tokensNoFunction.push(token);
        } else {
            context.source.push(token.value);
        }
        switch (context.stage) {
            case "404":
                if (token.type === 'keyword')
                    if (token.value === 'function') {
                        context.stage = '.Name';
                        tokensNoFunction.pop();
                    } else if (token.value === 'var') {
                        context.stage = 'var';
                    }
                break;
            case".Name":
                if (token.type === 'identifier') {
                    context.Name = token.value;
                    context.stage = '(';
                } else if (token.value === '(' && token.type === 'delimiter') {
                    context = __createFunctionTemplate();
                }
                break;
            case"(":
                if (token.value === '(' && token.type === 'delimiter') {
                    context.arguments = [];
                    context.stage = 'arguments';
                }
                break;
            case"arguments":
                switch (token.type) {
                    case"delimiter":
                        if (token.value === ',') {
                            continue;
                        } else if (token.value === ')') {
                            context.stage = 'DelimiterBody';
                        }
                        break;
                    case"identifier":
                        context.arguments.push(token.value);
                }
                break;
            case"DelimiterBody":
                if (token.value === '{' && token.type === 'delimiter') {
                    context.stage = 'body';
                    context.nested = 1;
                }
                break;
            case"body":
                if (token.value === '{' && token.type === 'delimiter') {
                    context.nested++;
                } else if (token.value === '}' && token.type === 'delimiter') {
                    if ((--context.nested) === 0) {
                        functions.push(new __SandBoxedBuiltInFunction(
                            context.Name, context.arguments,
                            context.body, context.source, globalObject_));
                        context = __createFunctionTemplate();
                    }
                } else {
                    context.body.push(token);
                }
                if (context.nested < 0) {
                    throw new SyntaxError('too much DEDENT');
                }
                break;
            case"var":
                if (token.type !== 'identifier') {
                    throw new SyntaxError(`${token.type} (${token.value}) found, identifier expected`);
                } else {
                    hoistedVars.push(token.value);
                    context = __createFunctionTemplate();
                }
                break;
            default:
        }
    }
    if (!new.target) {
        //called without new
        return __tokens;//throw new TypeError("SandboxedFunction must be invoked with 'new'");
    }
    this.tokens = __tokens;
    this.functions = functions;
    this.hoistedVars = hoistedVars;
    this.globalObject = globalObject_;
    this.tokensNoFunction = tokensNoFunction;
    /*this.globalObject.console = {
        log: function (...rest) {
            console.log(rest);
        }
    };*/
    for (const function1 of this.functions) {
        this.globalObject[function1.name] = function1;
    }

}

SandboxedFunction.prototype.run = function (Arguments) {
    if (Arguments === undefined) {
        Arguments = {length: 0, parameters: []};
    }

    function preformAssignment(context, accessChain) {
        console.log(context, accessChain);
    }

    //let nested = 0;
    let isStrict = null;
    const accessChain = [];
    const context = new Proxy({stage: '404', functionChain: [], foundReturn: false, setVar: [], unaryMinus: false},
        {
            set(target, p, newValue, receiver) {
                if (p === 'stage') console.log('Reflect.set', newValue);
                return Reflect.set(target, p, newValue);
            }
        });
    for (const token of this.tokensNoFunction) {
        if (token.type === "comment") continue;
        if (isStrict === null && token.type === 'string' && /(["'])use strict\1/.test(token.value)) {
            throw new Error('Strict mode not supported Yet');// isStrict = true;
        } else {
            isStrict = false;
        }
        if (context.foundReturn && ((token.type === 'delimiter' && token.type === ';')
            || (token.value === 'whitespace' && /\n/.test(token.value)) || token.type === 'endOfFile')) {
            return this.__resolveReference(this.globalObject, accessChain);
        }
        switch (token.type) {
            case'keyword':
                if (context.stage === '404') {
                    if (token.value === 'return') {
                        context.foundReturn = true;
                        context.stage = 'expression';
                    }
                }
                break;
            case'identifier':
            case'DotAccess':
                accessChain.push(token.value);
                console.log(188, context.stage);
                if (context.stage === '404')
                    context.stage = 'Id';
                break;
            case'number':
                let n = parseNumber(token.value, parseNumber.disallowNaN);
                n = context.unaryMinus ? -n : n;
                if (context.foundReturn && context.stage === 'expression') {
                    return n;
                } else if (context.stage === 'argument') {
                    context.functionChain[context.functionChain.length - 1].with.push(n);
                    context.stage = 'argument,';
                }
                break;
            case'BigInt':
                let bigint = BigInt(token.value);
                bigint = context.unaryMinus ? -bigint : bigint;
                if (context.foundReturn && context.stage === 'expression') {
                    return bigint;
                } else if (context.stage === 'argument') {
                    context.functionChain[context.functionChain.length - 1].with.push(bigint);
                    context.stage = 'argument,';
                }
                break;
            case'string':
                if (context.stage === 'argument') {
                    context.functionChain[context.functionChain.length - 1].with.push(token.value);
                    context.stage = 'argument,';
                } else if (context.foundReturn) {
                    return token.value;
                }
                break;
            case'operator':
                if (token.value === '=' && context.stage === 'Id') {
                    context.setVar.push([...accessChain]);
                    context.stage = 'expression';
                    accessChain.length = 0;
                } else if (token.value === '-') {
                    context.unaryMinus = true;
                }
                break;
            case'delimiter':
                if (token.value === '(') {
                    if ('argument argument, Id expression'.split(' ').includes(context.stage)) {
                        console.log('accessChain', accessChain, context.stage);
                        context.functionChain.push({'accessTo': [...accessChain], with: []});
                        context.stage = 'argument';
                        accessChain.length = 0;
                    }
                } else if (token.value === ';' &&
                    'argument argument, Id expression'.split(' ').includes(context.stage)) {
                    if (context.stage === 'expression') {
                        preformAssignment(context, accessChain);
                    }
                } else if (token.value === ';') {
                    throw new Error(JSON.stringify({context, accessChain}));
                } else if (token.value === ')' && 'argument argument,'.split(' ').includes(context.stage)) {
                    const theFunction = context.functionChain.pop();//[context.functionChain.length - 1];
                    const theActualFunction = this.__resolveReference(this.globalObject, theFunction.accessTo);
                    /*console.log(
                        this.__resolveReference(this.globalObject,
                            theFunction.accessTo),
                        theFunction.accessTo, theFunction.with);*/
                    const type = typeOf(theActualFunction);
                    if (type === 'undefined' || type === 'NULL') {
                        console.error(theFunction, theActualFunction);
                        throw new TypeError(`do not call undefined, you attempted to call (${theFunction.accessTo.join('.')})`);
                    } else if ((type === 'function' || theActualFunction.constructor === __SandBoxedBuiltInFunction)
                        || (type === 'object' && (SandboxedFunction.prototype.__call in theActualFunction))) {
                        let returnValue = undefined;
                        if (theActualFunction.constructor === __SandBoxedBuiltInFunction) {
                            returnValue = theActualFunction.callMe({
                                length: theFunction.with.length,
                                parameters: theFunction.with,
                            });
                        } else if (type === 'function') {
                            returnValue = theActualFunction(...theFunction.with);
                        } else if (type === 'object') {
                            if (SandboxedFunction.prototype.__call in theActualFunction) {
                                returnValue = theActualFunction[SandboxedFunction.prototype.__call](...theFunction.with);
                            } else if (SandboxedFunction.prototype.__callsp in theActualFunction) {
                                returnValue = theActualFunction[SandboxedFunction.prototype.__callsp]({
                                    length: [...theFunction.with].length, parameters: [...theFunction.with],
                                });
                            }
                        }
                        const returnIn = context.functionChain[context.functionChain.length - 1];
                        if (returnIn !== undefined && returnIn.length > 0) {
                            returnIn.with.push(returnValue);
                        } else if (context.foundReturn) {
                            return returnValue;
                        }
                    } else {
                        throw new TypeError(`${type} is not callable (${theActualFunction})`);
                    }
                    if (context.functionChain.length > 0) {
                        context.stage = 'argument,';
                    } else {
                        console.info('context',context,accessChain);
                        context.stage = '404';
                    }
                } else if (token.value === ',' && context.stage === 'argument,') {
                    context.stage = 'argument';
                }
                break;
            case'whitespace':
                if (context.foundReturn && /\n/.test(token.value)) {
                    console.warn('\\n before return found');
                    return undefined;
                }
                break;
            case'templateLiteral':
                break;
        }
    }
    return undefined;
};
SandboxedFunction.prototype.__undef = Symbol('__undef');
SandboxedFunction.prototype.__callsp = Symbol('spcall');
SandboxedFunction.prototype.__call = Symbol('call');
SandboxedFunction.prototype.__tokenize = function (jsCode) {
    const tokens = [];
    const regexPatterns = [
        {type: "keyword", regex: /\b(if|else|return|function|var|let|const|for|while|true|false|null)\b/},
        {type: "comment", regex: /\/\/.*|\/\*[\s\S]*?\*\//},
        {type: "identifier", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
        {type: "number", regex: /\b\d+(\.\d+)?\b/},
        {type: "string", regex: /(["'])(?:(?!\1).)*\1/},
        {type: "operator", regex: /[+\-*/=<>!&|]+/},
        {type: "delimiter", regex: /[{}()\[\];,]/},
        {type: "whitespace", regex: /\s+/},
        {type: "DotAccess", regex: /\.\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
        {type: "templateLiteral", regex: /`[\s\S]*?`/},
        {type: "BigInt", regex: /\b\d+n\b/},
    ];
    jsCode = normalize_newlines(String(jsCode));
    while (jsCode.length > 0) {
        let match = null;
        for (const {type, regex} of regexPatterns) {
            const result = regex.exec(jsCode);
            if (result && result.index === 0) {
                match = {type, value: result[0]};
                break;
            }
        }
        if (!match) {
            throw new Error(`Unrecognized token at: \`\`\`${jsCode.slice(0, 10)}\`\`\``);
        }
        let offset = 0;
        /*if (match.type !== "whitespace" && match.type !== "comment") {tokens.push(match);}*/
        if (match.type === 'DotAccess') {
            match.value = String(match.value).replace(/^\./, '');
            offset++;
        }
        tokens.push(match);
        jsCode = jsCode.slice(match.value.length + offset);
    }
    return __array_append(tokens, {type: 'endOfFile', value: 'EOF'});
};

SandboxedFunction[Symbol.toStringTag] = function () {
    return 'SandBoxedFunction';
};

SandboxedFunction.prototype.toJSON = function () {
    return {
        type: 'SandboxedFunction',// tokens: this.tokens,
        tokensNoFunction: this.tokensNoFunction,
        functions: this.functions,
        hoistedVars: this.hoistedVars,
        globalKeys: Object.keys(this.globalObject),
    };
};

function __StringOrSymbol(any) {
    if ((typeof any) === 'symbol') {
        return any;
    }
    return String(any);
}

/*function resolveReference(self, reference) {
    const array = [...reference].map(__StringOrSymbol);
    const pop = array.shift();
    if (pop === undefined) return self;
return resolveReference(self[pop.replace(/^\./,'')], array);
}*/
const resolveReference = SandboxedFunction.prototype.__resolveReference = (function (baseObject, propertyChain) {
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
});

const setProperty = SandboxedFunction.prototype.setProperty = (function (obj, keys, value) {
    if (!Array.isArray(keys) || keys.length === 0) {
        throw new Error("Keys must be a non-empty array of strings.");
    }

    let target = obj;
    keys = keys.map(__StringOrSymbol);
    // Traverse through the keys except the last one
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        /*// Ensure the key exists in the object, or create an empty object
        if (typeof target[key] !== 'object' || target[key] === null) {
            target[key] = {};}*/
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
});

RegExp.prototype.toJSON = function () {
    return this.toString();
};

function __SandBoxedBuiltInFunction(name, arguments_param, body, src, thisContext) {
    if (!new.target) {
        //called without new
        throw new TypeError("__SandBoxedBuiltInFunction must be invoked with 'new'");
    }
    this.expected_argument_count = arguments_param.length;
    // this.arguments_param = arguments_param;
    this.name = name;
    this.body = body;
    this.source = src.join('');
    this.callMe = function (object) {
        return (new SandboxedFunction({tokens: this.body}, thisContext)).run(object);
    };
}

__SandBoxedBuiltInFunction.prototype.toJSON = function () {
    return {
        type: '__SandBoxedBuiltInFunction', name: this["name"],
        expected_argument_count: this['expected_argument_count'],
        asString: this.source, body: this.body,
    };
};
__SandBoxedBuiltInFunction[Symbol.toStringTag] = function () {
    return 'SandBoxedFunctionBuiltIn';
};

function __array_append(array, ...rest) {
    array.push(...rest);
    return array;
}

function __createFunctionTemplate() {
    return {
        stage: '404',
        Name: undefined,
        arguments: [],
        nested: 0,
        body: [],
        source: ['function'],
    };
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
