// javascript
function SandboxedFunction(javascript, globalObject) {
    let __tokens, thisContext;
    if ('tokens' in Object(javascript) && 'thisContext' in Object(javascript)) {
        __tokens = javascript.tokens;
        thisContext = javascript.thisContext;
    } else {
        __tokens = SandboxedFunction.__tokenize(javascript);
    }
    if (!new.target) {
        return;
    }
    this.__tokens = __tokens;
}

SandboxedFunction.__tokenize = function (javascript) {
    let index = 0, line = 0, column = 0,
        jsCode = (function (string) {
            return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        })(String(javascript));
    const tokens = [];
    const regexPatterns = [
        {type: "keyword", regex: /\b(?:if|else|return|function|var|let|const|for|while|true|false|null)\b/},
        {type: "comment", regex: /\/\/.*|\/\*[\s\S]*?\*\//},
        {type: "identifier", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
        {type: "number", regex: /\b\d+(\.\d+)?\b/},
        {type: "operator", regex: /[+\-*/=<>!&|]+/},
        {type: "delimiter", regex: /[{}\[\]();,]/},
        {type: "whitespace", regex: /\s+/},
        {type: "DotAccess", regex: /\.\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
        {type: "BigInt", regex: /\b\d+n\b/},
    ];
    while (jsCode.length > 0) {
        let match = null;
        const regexpArray = jsCode.match(/^(['"`\/])/);
        if (regexpArray) {
            let length = 0, backslashed = false;
            const array = [], delimiter = regexpArray[1];
            for (const strx of jsCode.slice(1)) {
                if (++length > jsCode.length) {
                    throw new Error(`Unended String`);
                }

                if (/^[\\'"`\/]$/.test(strx)) {
                    if (strx === delimiter && !backslashed) {
                        break;
                    } else if (strx === '\\') {
                        if (backslashed) {
                            array.push(strx);
                            backslashed = false;
                        } else {
                            backslashed = true;
                        }
                    } else {
                        array.push(strx);
                    }
                } else if (strx === '\n' || strx === '\r') {
                    if (delimiter === '\'' || delimiter === "\"") {
                        throw new Error('string literal contains an unescaped line break');
                    } else {
                        array.push(strx);
                    }
                } else {
                    array.push(strx);
                }
            }
            if (length === 0) {
                throw new Error(`0-length String`);
            }
            jsCode = jsCode.slice(length);
            const value = array.join('');
            if (delimiter === '\'' || delimiter === "\"") {
                match = {type: 'string', value, delimiter};
            } else if (delimiter === '/') {
                match = {type: 'RegExp', value, delimiter, jsCode};
            } else if (delimiter === '`') {
                throw new Error(`Template literals not supported`);
                // match = {type: 'TemplateLiteral', value, delimiter};
            } else {
                throw new Error(`Unknown Demiliter At: \`\`\`${jsCode.slice(0, 10)}\`\`\``);
            }
        } else {
            for (const {type, regex} of regexPatterns) {
                const result = regex.exec(jsCode);
                if (result && result.index === 0) {
                    match = {type, value: result[0]};
                    break;
                }
            }
        }
        if (!match) {
            throw new Error(`Unrecognized token at: \`\`\`${jsCode.slice(0, 10)}\`\`\``);
        }
        let offset = 0, string = String(match.value);
        index += string.length;
        if (/\n/.test(string)) {
            line += 1;
            column = 0;
            //match = Object.assign({}, match, {index, line, column});
            column += string.replace(/.+\n/, '').length;
        } else {
            column += string.length;
            //match = Object.assign({}, match, {index, line, column});
        }
        /*if (match.type !== "whitespace" && match.type !== "comment") {tokens.push(match);}*/
        if (match.type === 'DotAccess') {
            match.value = String(match.value).replace(/^\./, '');
            offset++;
        }
        tokens.push(match);
        jsCode = jsCode.slice(match.value.length + offset);
    }
    //tokens.push({type: 'delimiter', value: ';'});
    return tokens;
};
/*function SandboxedFunction(javascript, globalObject) {
    let __tokens, thisContext;
    if ('tokens' in Object(javascript) && 'thisContext' in Object(javascript)) {
        __tokens = javascript.tokens;
        thisContext = javascript.thisContext;
    } else {
        __tokens = SandboxedFunction.prototype.__tokenize(javascript);
    }

    const functions = [];
    let context = __createFunctionTemplate();
    const defaultObject = {
        console: {
            log: function (parameters, selfObject) {
                const argumentsArray = ([...parameters.parameters].map(function (value) {
                    return value.value;
                }));
                console.log(...argumentsArray);
                selfObject.consoleBuffer.append(argumentsArray.toString());
                return EncapsulateObject(undefined);
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

    function defaultThis() {
        return {
            consoleBuffer: (thisContext?.consoleBuffer) ?? new ObjectBufferPHP()
        };
    }

    const default_this = defaultThis();
    const hoistedVars = [];
    const tokensNoFunction = [];
    for (const token of __tokens) {
        if (context.stage === '404') {
            tokensNoFunction.push(token);
        } else {
            if (token.type === 'DotAccess') {
                context.source.push('.' + token.value);
            } else {
                context.source.push(token.value);
            }
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
                            context.body, context.source,
                            globalObject_,
                            thisContext ?? default_this));
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
    this.thisContext = thisContext ?? default_this;
    this.globalObject = globalObject_;
    this.tokensNoFunction = tokensNoFunction;
    for (const function1 of this.functions) {
        this.globalObject[function1.name] = function1;
    }
}

SandboxedFunction.prototype.run = function () {
    let tokenIndex = 0;
    const consoleBuffer = this.thisContext.consoleBuffer;
    assert(consoleBuffer instanceof ObjectBufferPHP, 'consoleBuffer instanceof ObjectBufferPHP');
    //(this.thisContext?.consoleBuffer) ?? new ObjectBufferPHP();
    const context = {
        stage: '404', operations: [],
        PARENTheses: [], returnFound: false,
        thisContext: this.thisContext
    };
    let isStrict = null;
    let operations = context.operations;
    context.PARENTheses.push(operations);
    const accessChain = [];

    function calculateNow() {
        const shouldBeInline = calculateExpression(
            context.operations,
            calculateExpression.warnIfEmpty
            | calculateExpression.allowOnlyUndefined,
            context.thisContext,
        );
        if (shouldBeInline['type'] === 'undefined') {
            return context.operations = [];
        }
        return context.operations = [shouldBeInline];
    }

    let returnNow = false;
    while (tokenIndex < this.tokensNoFunction.length) {
        const token = this.tokensNoFunction[tokenIndex++];
        if (isStrict === null && token.type === 'string' && /(["'])use strict\1/.test(token.value)) {
            throw new Error('Strict mode not supported Yet');// isStrict = true;
        } else {
            isStrict = false;
        }
        switch (token.type) {
            case'keyword':
                if (token.value === 'return') {
                    context.returnFound = true;
                } else if (token.value === 'null') {
                    operations.push({type: 'null', value: null});
                }
                break;
            case'identifier':
            case'DotAccess':
                accessChain.push({type: token.type, value: token.value.replace(/^\./, '')});
                context.stage = 'accessTo';
                break;
            case'number':
                let n = parseNumber(token.value, parseNumber.disallowNaN);
                operations.push({type: 'number', value: n});
                break;
            case'BigInt':
                break;
            case'string':
                operations.push({type: 'string', value: token.value.slice(1, -1)});
                break;
            case'operator':
                operations.push({type: 'operator', value: token.value});
                break;
            case'delimiter':
                if (token.value === ';') {
                    if (context.operations.length > 0) {
                        operations = calculateNow();
                    }
                    if (context.returnFound) {
                        returnNow = true;
                    }
                } else if (token.value === '(' || token.value === ')') {
                    if (context.stage === 'accessTo' && token.value === '(') {
                        const array = [];
                        let theActualFunction = this.__resolveReference(
                            this.globalObject, accessChain.map(function (thisContext) {
                                return thisContext.value;
                            }),
                        );
                        const type = typeOf(theActualFunction);
                        if (type === 'undefined' || type === 'NULL') {
                            throw new TypeError(`do not call undefined, you attempted to call (${[...accessChain].join('.')})`);
                        }
                        const http = {type: 'functionCall', value: theActualFunction, parameters: array};
                        operations.push(http);
                        operations = array;
                        context.PARENTheses.push(http);
                        accessChain.length = 0;
                        context.stage = 'arguments';
                    } else {
                        if (token.value === ')') {
                            context.PARENTheses.pop();
                            if ((operations = context.PARENTheses[context.PARENTheses.length - 1]) === undefined) {
                                throw new SyntaxError('mismatched PARENTheses'.toLowerCase());
                            }
                        } else if (token.value === '(') {
                            operations.push({type: 'accessChain', value: [...accessChain]});
                            accessChain.length = 0;
                            const array = [];
                            operations.push(array);
                            operations = array;
                            context.PARENTheses.push(array);
                        }
                    }
                }
                break;
            case'whitespace':
                if (context.returnFound && token.value.includes('\n')) {
                    operations = calculateNow();
                    returnNow = true;
                }
                break;
            case'templateLiteral':
                break;
        }
        if (returnNow) break;
    }
    if (context.operations.length > 0) {
        calculateNow();
    }
    const returnValue = {value: EncapsulateObject(undefined), console: consoleBuffer.toString(),};
    if (returnNow) returnValue.value = context.operations[0];
    return returnValue;
};
SandboxedFunction.prototype.__undef = Symbol('__undef');
SandboxedFunction.prototype.__callsp = Symbol('spcall');
SandboxedFunction.prototype.__call = Symbol('call');*/
// SandboxedFunction.prototype.__tokenize = function (jsCode) {
//     const tokens = [];
//     const regexPatterns = [
//         {type: "keyword", regex: /\b(if|else|return|function|var|let|const|for|while|true|false|null)\b/},
//         {type: "comment", regex: /\/\/.*|\/\*[\s\S]*?\*\//},
//         {type: "identifier", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
//         {type: "number", regex: /\b\d+(\.\d+)?\b/},
//         {type: "string", regex: /(["'])(?:(?!\1).)*\1/},
//         {type: "operator", regex: /[+\-*/=<>!&|]+/},
//         {type: "delimiter", regex: /[{}\[\]();,]/},
//         {type: "whitespace", regex: /\s+/},
//         {type: "DotAccess", regex: /\.\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
//         {type: "templateLiteral", regex: /`[^`]*`/},
//         {type: "BigInt", regex: /\b\d+n\b/},
//     ];
//     jsCode = normalize_newlines(String(jsCode));
//     while (jsCode.length > 0) {
//         let match = null;
//         for (const {type, regex} of regexPatterns) {
//             const result = regex.exec(jsCode);
//             if (result && result.index === 0) {
//                 match = {type, value: result[0]};
//                 break;
//             }
//         }
//         if (!match) {
//             throw new Error(`Unrecognized token at: \`\`\`${jsCode.slice(0, 10)}\`\`\``);
//         }
//         let offset = 0;
//         /*if (match.type !== "whitespace" && match.type !== "comment") {tokens.push(match);}*/
//         if (match.type === 'DotAccess') {
//             match.value = String(match.value).replace(/^\./, '');
//             offset++;
//         }
//         tokens.push(match);
//         jsCode = jsCode.slice(match.value.length + offset);
//     }
//     return __array_append(tokens, {type: 'delimiter', value: ';'});};
/*SandboxedFunction.prototype.addBufferListener = function (function1) {
    this.thisContext.consoleBuffer.addBufferListener(function1);
    return this;
};


function EncapsulateObject(value) {
    return {type: typeOf(value), value};
}

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

SandboxedFunction.prototype.__resolveReference = (function (baseObject, propertyChain) {
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
SandboxedFunction.prototype.setProperty = (function (obj, keys, value) {
    if (!Array.isArray(keys) || keys.length === 0) {
        throw new Error("Keys must be a non-empty array of strings.");
    }

    let target = obj;
    keys = keys.map(__StringOrSymbol);
    // Traverse through the keys except the last one
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

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

function __SandBoxedBuiltInFunction(name, arguments_param, body, src, globalContext, thisContext) {
    if (!new.target) {
        //called without new
        throw new TypeError("__SandBoxedBuiltInFunction must be invoked with 'new'");
    }
    this.expected_argument_count = arguments_param.length;
    // this.arguments_param = arguments_param;
    this.name = name;
    this.body = body;
    this.source = src.join('');
    this.callMe = function (object, self) {
        const function1 = new SandboxedFunction({
            tokens: this.body, thisContext
        }, globalContext);
        return function1.run(object, self).value;
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

function __createFunctionTemplate() {
    return {
        stage: '404',
        Name: undefined,
        arguments: [],
        nested: 0,
        body: [],
        source: ['function'],
    };
}*/
`function hypertext() {
    return "hello";
}
return hypertext();`
console.log(JSON.stringify(new SandboxedFunction(`console.log(/^/gi);`), null, 2));
