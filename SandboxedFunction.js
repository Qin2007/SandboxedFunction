const function1 = Symbol('function');
export const SandboxedFunction = function (javascript, globalObject) {
    const self = new.target ? this : Object.create(SandboxedFunction.prototype);
    self.instructionTokens = SandboxedFunction.__tokenize(javascript);
    const defaultObject = {
        console: new SandboxedFunction.SandboxedFunctionWrapper(function () {
        }),
        /*console: {
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
            trunc: function (n:number) :number{
                return Math.trunc(n);
            }
        },
        Number: {
            [SandboxedFunction.__call]: function (toNumber:any):number {
                return Number(toNumber);
            },
        },
        Date: {
            [SandboxedFunction.__callBuiltIn](object) {
                // object.length;
                // noinspection JSCheckFunctionSignatures
                return new Date(...object.parameters);
            }
        },
        versionId: '0.0.42',*/
    };
    if (globalObject !== undefined) {
        globalObject = Object.assign(defaultObject, DeepProxy(globalObject));
    }
    self.globalObject = Object(globalObject);
    if (!new.target)
        return self.toHTMLString();
};
SandboxedFunction.SandboxedFunctionHTMLClass = 'SandFunc_';
SandboxedFunction.prototype.toHTMLString = function () {
    const String_raw = function (string) {
        return String.raw({ raw: string });
    }, result = [], htmlencode = function (string) {
        return String(string).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }, id = SandboxedFunction.SandboxedFunctionHTMLClass;
    for (let instructionToken of this.instructionTokens) {
        switch (instructionToken.type) {
            case "keyword":
                result.push(`<span class=${id}keyword>${htmlencode(instructionToken.value)}</span>`);
                break;
            case "comment":
                result.push(`<span class=${id}comment>${htmlencode(instructionToken.value)}</span>`);
                break;
            case "identifier":
                result.push(`<span class=${id}Identifier>${htmlencode(instructionToken.value)}</span>`);
                break;
            case "number":
                result.push(`<span class=${id}BigInt>${htmlencode(instructionToken.value)}</span>`);
                break;
            case "operator":
            case "delimiter":
                result.push(`<span class=${id}delimiter>${htmlencode(instructionToken.value)}</span>`);
                break;
            case "whitespace":
                if (!/^\s+$/.test(instructionToken.value)) {
                    throw 'Whitespace contains non whitespace characters';
                }
                result.push(instructionToken.value);
                break;
            case "DotAccess":
                result.push(`<span class=${id}DotAccess><span class=${id}delimiter>.</span><span class=${id}Identifier>${htmlencode(instructionToken.value)}</span></span>`);
                break;
            case "BigInt":
                result.push(`<span class=${id}BigInt>${htmlencode(instructionToken.value)}</span>`);
                break;
            case "RegExp":
                if (!(instructionToken.regexp instanceof RegExp)) {
                    throw new Error('instructionToken.regexp is not an instanceof RegExp');
                }
                const regexp = instructionToken.regexp, regex = htmlencode(regexp.source);
                const strxxx = regex.replaceAll(/\\[dDsSwWBbnrvt]|\.|\w+/g, function (match) {
                    if (/^\\[a-z]$/.test(match)) {
                        return `<span class="${id}_RegExp_esc">${match}</span>`;
                    }
                    else if (/^\.$/.test(match)) {
                        return `<span class="${id}Black">${match}</span>`;
                    }
                    else if (/^\w+$/.test(match)) {
                        return `<span class="${id}string">${match}</span>`;
                    }
                    return `${match}`;
                });
                result.push(`<span class=${id}RegExp>/${strxxx}/${regexp.flags}</span>`);
                break;
            case "string":
                const strx = instructionToken.delimiter + String_raw(instructionToken.value) + instructionToken.delimiter;
                result.push(`<span class=${id}string>${htmlencode(strx).replaceAll(/\\\\/g, `<span class=${id}backslash></span>`)}</span>`);
                break;
            case "TemplateLiteral":
                const templ = instructionToken.delimiter + String_raw(instructionToken.value);
                result.push(`<span class=${id}string>${htmlencode(templ) + instructionToken.delimiter}</span>`);
                break;
        }
    }
    return `<pre class=${id}outerHTML role=none><code>${result.join('')}</code></pre>`;
};
SandboxedFunction.__undef = Symbol('__undef');
SandboxedFunction.__tokenize = function (javascript) {
    let index = 0, line = 0, column = 0, jsCode = (function (string) {
        return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    })(String(javascript));
    //keywords=/\b(?:if|else|return|function|var|let|const|for|while|true|false|null)\b/
    const keywords = /\b(?:if|else|switch|case|default|for|while|do|break|continue|return|throw|try|catch|finally|var|let|const|function|class|extends|super|this|new|delete|import|export|from|static|true|false|null|typeof|instanceof|void|yield|with|debugger|in|of)\b/;
    const tokens = [], regexPatterns = [
        { type: "keyword", regex: keywords, },
        { type: "comment", regex: /\/\/.*|\/\*[\s\S]*?\*\// },
        { type: "identifier", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
        { type: "number", regex: /\b\d+(\.\d+)?\b/ },
        { type: "operator", regex: /[+\-*/=<>!&|]+/ },
        { type: "operator", regex: /[?:]+/ },
        { type: "delimiter", regex: /[{}\[\]();,]/ },
        { type: "whitespace", regex: /\s+/ },
        { type: "DotAccess", regex: /\.\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
        { type: "BigInt", regex: /\b\d+n\b/ },
    ], keepRegExp = function (regex, string) {
        const matchArray = string.match(regex);
        return (matchArray ?? [''])[0];
    }, templatalCalculatal = function (jsCode, length) {
        const storage = [];
        let inner_index = index, inner_line = line, inner_column = column;
        let indentation = 1, context = 'outSide', backslashed = false, templatalStart = false;
        for (const strxx of jsCode.slice(length)) {
            if (/['"\/`{}$\\]/.test(strxx)) {
                if (context === 'outSide') {
                    if (strxx === '/') {
                        context = 'slash';
                    }
                    else if (strxx === `\``) {
                        context = 'templatalString';
                    }
                    else if (strxx === '\'') {
                        context = 'string-single';
                    }
                    else if (strxx === "\"") {
                        context = 'string-double';
                    }
                    else if (strxx === "\\") {
                        throw new SyntaxError(`Backslash found outside enclosure (line:${inner_line}, column:${inner_column}, (index:${inner_index}))`);
                    }
                    else if (strxx === "{") {
                        ++indentation; //console.log('indentation-up', indentation);
                    }
                    else if (strxx === "}") {
                        --indentation; //console.log('indentation-down', indentation);
                    }
                }
                else if (context === 'templatalString') {
                    if (strxx === "$" && !backslashed) {
                        templatalStart = true;
                    }
                    else if (strxx === "{" && templatalStart && !backslashed) {
                        storage.push(templatalCalculatal(jsCode, inner_index));
                        templatalStart = false;
                    }
                    else if (strxx === `\`` && !backslashed) {
                        context = 'outSide';
                    }
                    else if (strxx === "\\" && !backslashed) {
                        storage.push(strxx);
                        backslashed = true;
                        ++inner_column;
                        ++inner_index;
                        continue;
                    }
                }
                else if (context === 'string-single' || context === 'string-double') {
                    if (strxx === "\n") {
                        throw new SyntaxError(`newline found inside string literal (line:${inner_line}, column:${inner_column}, (index:${inner_index}))`);
                    }
                    else if (strxx === '\'' && context === 'string-single' && !backslashed) {
                        context = 'outSide';
                    }
                    else if (strxx === "\"" && context === 'string-double' && !backslashed) {
                        context = 'outSide';
                    }
                    else if (strxx === "\\" && !backslashed) {
                        storage.push(strxx);
                        backslashed = true;
                        ++inner_column;
                        ++inner_index;
                        continue;
                    }
                }
            }
            ++inner_index;
            ++inner_column;
            if (strxx === '\n') {
                ++inner_line;
                inner_column = 0;
            }
            if (indentation === 0) {
                return storage.join('');
            }
            storage.push(strxx);
        }
        throw new SyntaxError(`Unfinished Templatal expression (${indentation}), (line:${inner_line}, column:${inner_column}, (index:${inner_index}))`);
    };
    while (jsCode.length > 0) {
        let match = null, slice = true;
        const regexpArray = jsCode.match(/^(['"`\/])(?!\/)/);
        if (regexpArray && !/\/\*/.test(jsCode)) {
            let length = 0, backslashed = false, skip = 0, templateStart = false;
            const array = [], delimiter = regexpArray[1], templatalExpressions = [];
            for (const strx of jsCode.slice(1)) {
                if (++length > jsCode.length) {
                    throw new Error(`Unfinished String`);
                }
                if (skip > 0) {
                    skip--;
                    continue;
                }
                if (templateStart) {
                    if (strx === '{') {
                        templatalExpressions.push({ type: "literal", value: array.join('') });
                        array.length = 0;
                        const addition = templatalCalculatal(jsCode, length + 1);
                        templatalExpressions.push({ type: "expression", value: addition });
                        skip += addition.length + 1;
                        continue;
                    }
                    //else {array.push(`\$`);}
                    templateStart = false;
                }
                if (/^[\\'"`\/]$/.test(strx)) {
                    if (strx === delimiter && !backslashed) {
                        break;
                    }
                    else if (strx === '\\') {
                        backslashed = !backslashed;
                        array.push(strx);
                    }
                    else {
                        array.push(strx);
                    }
                }
                else if (delimiter === '\`') {
                    if (strx === '$' && !backslashed) {
                        templateStart = true;
                        continue;
                    }
                    else {
                        array.push(strx);
                    }
                }
                else if (strx === '\n' || strx === '\r') {
                    if (delimiter === '\'' || delimiter === "\"") {
                        throw new Error('string literal contains an unescaped line break');
                    }
                    else {
                        array.push(strx);
                    }
                }
                else {
                    array.push(strx);
                }
                backslashed = false;
            }
            if (length === 0) {
                throw new Error(`0-length String`);
            }
            jsCode = jsCode.slice(length + 1);
            const value = array.join('');
            if (delimiter === '\'' || delimiter === "\"") {
                match = { type: 'string', value, delimiter, index, line, column };
            }
            else if (delimiter === '/') {
                const flags = keepRegExp(/^[dgimsuvy]+/, jsCode), regexp = new RegExp(value.slice(0, value.length - 1), flags);
                jsCode = jsCode.slice(flags.length);
                regexp.toJSON = regexp.toString;
                match = { type: 'RegExp', value, delimiter, flags, regexp, index, line, column };
            }
            else if (delimiter === '`') {
                // throw new Error(`Template literals not supported`);
                templatalExpressions.push({ type: "literal", value: array.join('') });
                match = {
                    type: 'TemplateLiteral',
                    value: templatalExpressions.map(function (templatalExpression) {
                        if (templatalExpression.type === 'literal') {
                            return String(templatalExpression.value);
                        }
                        else if (templatalExpression.type === 'expression') {
                            return `\${${String(templatalExpression.value)}}`;
                        }
                        else {
                            throw new Error('templatalExpression invalid type');
                        }
                    }).join(''),
                    delimiter, templatalExpressions,
                    index, line, column
                };
            }
            else {
                throw new Error(`Unknown Demiliter At: \`\`\`${jsCode.slice(0, 10)}\`\`\``);
            }
            slice = false;
        }
        else {
            for (const { type, regex } of regexPatterns) {
                const result = regex.exec(jsCode);
                if (result && result.index === 0) {
                    match = { type, value: result[0], index, line, column };
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
        }
        else {
            column += string.length;
            //match = Object.assign({}, match, {index, line, column});
        }
        /*if (match.type !== "whitespace" && match.type !== "comment") {tokens.push(match);}*/
        if (match.type === 'DotAccess') {
            match.value = String(match.value).replace(/^\./, '');
            offset++;
        }
        tokens.push(match);
        // match.column = column;
        // match.index = index;
        // match.line = line;
        if (slice)
            jsCode = jsCode.slice(match.value.length + offset);
    }
    //tokens.push({type: 'delimiter', value: ';'});
    return tokens;
};
SandboxedFunction.style = SandboxedFunction.styletag = `<style>
        .SandboxedFunction_outerHTML {
            background-color: lightgray;
            border: 1px solid darkgray;
            color: black;
            margin: 1em 0;
            padding: 0.2em;
        }
        .SandboxedFunction_Black {
            color: black;
        }

        .SandboxedFunction_string {
            color: darkgreen;
        }

        .SandboxedFunction_keyword, .SandboxedFunction_backslash {
            color: #D66100;
        }

        .SandboxedFunction_Identifier {
            color: #986e09;
        }

        .SandboxedFunction_RegExp, .SandboxedFunction_BigInt, .SandboxedFunction_Number {
            color: #0073a6;
        }

        .SandboxedFunction__RegExp_esc {
            color: #a17d08;
        }
    </style>`.replaceAll(/SandboxedFunction_/ig, SandboxedFunction.SandboxedFunctionHTMLClass).replaceAll(/\s+/g, ' ');
SandboxedFunction.SandboxedFunctionWrapper = function (function1) {
    const self = new.target ? this : Object.create(SandboxedFunction.prototype);
    if (!(function1 instanceof Function)) {
        throw new TypeError('SandboxedFunctionWrapper can only wrap Function Objects');
    }
    self[SandboxedFunction.SandboxedFunctionWrapper.__function] = function1;
    if (!new.target)
        return self;
};
SandboxedFunction.SandboxedFunctionWrapper.__function = function1;
export class InternalSandboxedFunctionError extends Error {
}
SandboxedFunction.prototype.run = function (..._parameters) {
    const context = {
        stage: '404', currentObject: null, functions: {},
    }, instructionTokens = this.instructionTokens;
    let index = -1;
    while (++index < instructionTokens.length) {
        const instructionToken = instructionTokens[index], at = `(line:${instructionToken.line}, column:${instructionToken.column}, (index:${instructionToken.index}))`;
        if (context.currentObject !== null && context.currentObject.type === 'function') {
            context.currentObject.asStringArray.push(instructionToken.value);
        }
        if (context.stage === 'Function.body') {
            if (context.currentObject === null) {
                throw new InternalSandboxedFunctionError('context.currentObject is null ' + at);
            }
            context.currentObject.body.push(instructionToken);
            if (instructionToken.type === 'delimiter' && instructionToken.value === '}') {
                context.stage = '404';
                context.currentObject.asString = context.currentObject.asStringArray.join('');
                context.functions[context.currentObject.name] = context.currentObject;
                context.currentObject.asStringArray.length = 0;
                context.currentObject = null;
            }
            continue;
        }
        if (instructionToken.type === 'whitespace') {
            // empty
        }
        else if (instructionToken.type === 'keyword' && context.stage === '404' && instructionToken.value === 'return') {
        }
        else if (instructionToken.type === 'keyword' && context.stage === '404' && instructionToken.value === 'function') {
            context.stage = 'Function.name';
            context.currentObject = {
                type: 'function',
                name: `Function${Date.now()}`,
                parameters: [],
                body: [],
                asStringArray: ['function']
            };
        }
        else if (context.stage === 'Function.name') {
            if (instructionToken.type !== 'identifier') {
                throw new SyntaxError(`identifier expected (got \`${instructionToken.type}\`) at ${at}`);
            }
            if (context.currentObject === null) {
                throw new InternalSandboxedFunctionError('context.currentObject is null ' + at);
            }
            context.currentObject.name = instructionToken.value;
            context.stage = 'arguments(';
        }
        else if (context.stage === 'arguments(') {
            if (instructionToken.type !== 'delimiter' && instructionToken.value !== '(') {
                throw new SyntaxError(`\`(\` expected (got \`${instructionToken.type}\`) at ${at}`);
            }
            context.stage = 'arguments_Id';
        }
        else if (context.stage === 'arguments_Id') {
            if (instructionToken.value === ')') {
                context.stage = 'arguments_body{';
                continue;
            }
            else if (instructionToken.type !== 'identifier') {
                throw new SyntaxError(`identifier expected (got \`${instructionToken.type}\`) at ${at}`);
            }
            if (context.currentObject === null) {
                throw new InternalSandboxedFunctionError('context.currentObject is null ' + at);
            }
            context.currentObject.parameters.push(instructionToken.value);
            context.stage = 'arguments,';
        }
        else if (context.stage === 'arguments,') {
            if (instructionToken.value === ')') {
                context.stage = 'arguments_body{';
                continue;
            }
            if (instructionToken.type === 'delimiter' && (instructionToken.value === ',' || instructionToken.value === ')')) {
                if (instructionToken.value === ',') {
                    context.stage = 'arguments_Id';
                    continue;
                }
            }
            throw new SyntaxError(`\`,\` expected (got \`${instructionToken.type}\` \`${instructionToken.value}\`) at ${at}`);
        }
        else if (context.stage === 'arguments_body{') {
            if (instructionToken.type === 'delimiter' && instructionToken.value === '{') {
                context.stage = 'Function.body';
                continue;
            }
            throw new SyntaxError(`\`{\` expected at ${at}`);
        }
    }
    // for (const instructionToken of ) {}
    return context;
};
function DeepProxy(target) {
    if (new.target) {
        throw new TypeError("DeepProxy must be invoked without 'new'");
    }
    target = Object(target);
    const imaginary = new Map(); // Use a Map to handle objects with symbolic keys
    return new Proxy(target, {
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
        set(_target, prop, value, _receiver) {
            imaginary.set(prop, value); // Store in the imaginary object
            return true;
        },
        has(target, prop) {
            return imaginary.has(prop) || Reflect.has(target, prop);
        },
        deleteProperty(_target, prop) {
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
    });
}
export function typeOf(o, mode = 0) {
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
            if (o instanceof RegExp)
                return "RegExp";
        }
        if (m & typeOf.identifyDate) {
            if (o instanceof Date)
                return "Date";
        }
        if (m & typeOf.identifyPromise) {
            if (o instanceof Promise)
                return "Promise";
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
export class PrototypeMap {
    map;
    prototype = new PrototypeMap(new Map(), null);
    constructor(map = undefined, prototype = undefined) {
        if (map === undefined)
            map = new Map();
        if (!(map instanceof Map)) {
            throw new TypeError("First argument must be a Map.");
        }
        if (prototype !== null && !(prototype instanceof PrototypeMap)) {
            throw new TypeError("Second argument must be a PrototypeMap or undefined.");
        }
        this.map = map;
        this.prototype = prototype;
    }
    valueOf() {
        return this.map;
    }
    toString() {
        return this.map.toString();
    }
    toJSON() {
        const map = this.map, string = {};
        for (const [entry, value] of map.entries()) {
            string[entry] = value;
        }
        return string;
    }
    get size() {
        return this.map.size;
    }
    [Symbol.iterator]() {
        return this.map[Symbol.iterator]();
    }
    set(key, value) {
        if (typeof key !== "string" && typeof key !== "symbol") {
            throw new TypeError("Key must be a string or symbol.");
        }
        this.map.set(key, value);
        return this;
    }
    get(key) {
        if (typeof key !== "string" && typeof key !== "symbol") {
            throw new TypeError("Key must be a string or symbol.");
        }
        if (this.map.has(key)) {
            return this.map.get(key);
        }
        return this.prototype ? this.prototype.get(key) : undefined;
    }
    hasOwn(key) {
        if (typeof key !== "string" && typeof key !== "symbol") {
            throw new TypeError("Key must be a string or symbol.");
        }
        return this.map.has(key);
    }
    setPrototypeTo(prototype) {
        if (prototype !== null && !(prototype instanceof PrototypeMap)) {
            throw new TypeError("Argument must be a PrototypeMap or undefined.");
        }
        this.prototype = prototype;
        return this;
    }
    getPrototype() {
        return this.prototype;
    }
    static create(prototype) {
        if (prototype !== null && !(prototype instanceof PrototypeMap)) {
            throw new TypeError("Argument must be a PrototypeMap or undefined.");
        }
        return new PrototypeMap(new Map(), prototype);
    }
    get [Symbol.toStringTag]() {
        return 'PrototypeMap';
    }
}
