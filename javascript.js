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

SandboxedFunction.prototype.run = function () {

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
