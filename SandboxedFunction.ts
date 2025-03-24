// javascript
export type SandboxedFunction = {
    instructionTokens: instructionToken[],
    //toString(): string,
    globalObject: any,
    toHTMLString(this: SandboxedFunction): string,
};
type instructionToken = {
    type: "keyword" | "comment" | "identifier" | "number" | "operator" | "delimiter" | "whitespace" | "DotAccess" | "BigInt" | "RegExp" | "string" | "TemplateLiteral" | string,
    value: string, delimiter?: string, jsCode?: string, regexp?: RegExp,
    templatalExpressions?: ({ type: "literal" | "expression", value: string })[], flags?: string,
};

export interface SandboxedFunction_constructor {
    new(javascript: string, globalObject?: any | undefined): SandboxedFunction;

    (javascript: string, globalObject?: any | undefined): string;

    prototype: SandboxedFunction;

    __tokenize(javascript: string): instructionToken[];

    __callBuiltIn: symbol,
    __undef: symbol,
    __call: symbol,
    styletag: string,
    style: string,
    SandboxedFunctionHTMLClass: string,
}

export const SandboxedFunction: SandboxedFunction_constructor = function (this: SandboxedFunction, javascript: string, globalObject?: any | undefined): string | SandboxedFunction | void {//window = globalThis,
    const self: SandboxedFunction = new.target ? this : Object.create(SandboxedFunction.prototype);
    self.instructionTokens = SandboxedFunction.__tokenize(javascript);
    const defaultObject: any = {
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
    if (!new.target) return self.toHTMLString();
} as SandboxedFunction_constructor;
SandboxedFunction.SandboxedFunctionHTMLClass = 'SandFunc_';
SandboxedFunction.prototype.toHTMLString = function (this: SandboxedFunction): string {
    const String_raw = function (string: string): string {
        return String.raw({raw: string});
    }, result: string[] = [], htmlencode = function (string: string): string {
        return String(string).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }, id: string = SandboxedFunction.SandboxedFunctionHTMLClass;
    for (let instructionToken of this.instructionTokens) {
        switch (instructionToken.type) {
            case"keyword":
                result.push(`<span class=${id}keyword>${htmlencode(instructionToken.value)}</span>`);
                break;
            case"comment":
                result.push(`<span class=${id}comment>${htmlencode(instructionToken.value)}</span>`);
                break;
            case"identifier":
                result.push(`<span class=${id}Identifier>${htmlencode(instructionToken.value)}</span>`);
                break;
            case"number":
                result.push(`<span class=${id}BigInt>${htmlencode(instructionToken.value)}</span>`);
                break;
            case"operator":
            case"delimiter":
                result.push(`<span class=${id}delimiter>${htmlencode(instructionToken.value)}</span>`);
                break;
            case"whitespace":
                if (!/^\s+$/.test(instructionToken.value)) {
                    throw 'Whitespace contains non whitespace characters';
                }
                result.push(instructionToken.value);
                break;
            case"DotAccess":
                result.push(`<span class=${id}DotAccess><span class=${id}delimiter>.</span><span class=${id}Identifier>${htmlencode(instructionToken.value)}</span></span>`);
                break;
            case"BigInt":
                result.push(`<span class=${id}BigInt>${htmlencode(instructionToken.value)}n</span>`);
                break;
            case"RegExp":
                if (!(instructionToken.regexp instanceof RegExp)) {
                    throw new Error('instructionToken.regexp is not an instanceof RegExp');
                }
                const regex: string = htmlencode(instructionToken.regexp.source);

                result.push(`<span class=${id}RegExp>/${regex.replaceAll(/\\[dDsSwWBbnrvt]|\.|\w+/g, function (match: string): string {
                    if (/^\\[a-z]$/.test(match)) {
                        return `<span class="${id}_RegExp_esc">${match}</span>`
                    } else if (/^\.$/.test(match)) {
                        return `<span class="${id}Black">${match}</span>`
                    } else if (/^\w+$/.test(match)) {
                        return `<span class="${id}string">${match}</span>`;
                    }
                    return `${match}`;
                })}/${instructionToken.regexp.flags}</span>`);
                break;
            case"string":
                const strx: string = instructionToken.delimiter + String_raw(instructionToken.value) + instructionToken.delimiter;
                result.push(`<span class=${id}string>${htmlencode(strx).replaceAll(/\\\\/g,`<span class=${id}backslash></span>`)}</span>`);
                break;
            case"TemplateLiteral":
                const templ: string = instructionToken.delimiter + String_raw(instructionToken.value);
                result.push(`<span class=${id}string>${htmlencode(templ) + instructionToken.delimiter}</span>`);
                break;
        }
    }
    return `<pre class=${id}outerHTML role=none><code>${result.join('')}</code></pre>`;
};
SandboxedFunction.__undef = Symbol('__undef');
SandboxedFunction.__callBuiltIn = Symbol('callBuiltIn');
SandboxedFunction.__call = Symbol('call');
SandboxedFunction.__tokenize = function (javascript: string): instructionToken[] {
    let index: number = 0, line: number = 0, column: number = 0,
        jsCode: string = (function (string: string): string {
            return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        })(String(javascript));
    //keywords=/\b(?:if|else|return|function|var|let|const|for|while|true|false|null)\b/
    const tokens = [], regexPatterns = [
        {type: "keyword", regex: /\b(?:if|else|return|function|var|let|const|for|while|true|false|null|new)\b/},
        {type: "comment", regex: /\/\/.*|\/\*[\s\S]*?\*\//},
        {type: "identifier", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
        {type: "number", regex: /\b\d+(\.\d+)?\b/},
        {type: "operator", regex: /[+\-*/=<>!&|]+/},
        {type: "delimiter", regex: /[{}\[\]();,]/},
        {type: "whitespace", regex: /\s+/},
        {type: "DotAccess", regex: /\.\b[a-zA-Z_][a-zA-Z0-9_]*\b/},
        {type: "BigInt", regex: /\b\d+n\b/},
    ], keepRegExp = function (regex: RegExp, string: string): string {
        const matchArray = string.match(regex);
        return (matchArray ?? [''])[0];
    }, templatalCalculatal = function (jsCode: string, length: number): string {
        const storage: string[] = [];
        let inner_index: number = index, inner_line: number = line, inner_column: number = column;
        let indentation: number = 1, context: string = 'outSide', backslashed: boolean = false,
            templatalStart: boolean = false;
        for (const strxx of jsCode.slice(length)) {
            if (/['"\/`{}$\\]/.test(strxx)) {
                if (context === 'outSide') {
                    if (strxx === '/') {
                        context = 'slash';
                    } else if (strxx === `\``) {
                        context = 'templatalString';
                    } else if (strxx === '\'') {
                        context = 'string-single';
                    } else if (strxx === "\"") {
                        context = 'string-double';
                    } else if (strxx === "\\") {
                        throw new SyntaxError(`Backslash found outside enclosure (line:${inner_line}, column:${inner_column}, (index:${inner_index}))`);
                    } else if (strxx === "{") {
                        ++indentation;//console.log('indentation-up', indentation);
                    } else if (strxx === "}") {
                        --indentation;//console.log('indentation-down', indentation);
                    }
                } else if (context === 'templatalString') {
                    if (strxx === "$" && !backslashed) {
                        templatalStart = true;
                    } else if (strxx === "{" && templatalStart && !backslashed) {
                        storage.push(templatalCalculatal(jsCode, inner_index));
                        templatalStart = false;
                    } else if (strxx === `\`` && !backslashed) {
                        context = 'outSide';
                    } else if (strxx === "\\" && !backslashed) {
                        storage.push(strxx);
                        backslashed = true;
                        ++inner_column;
                        ++inner_index;
                        continue;
                    }
                } else if (context === 'string-single' || context === 'string-double') {
                    if (strxx === "\n") {
                        throw new SyntaxError(`newline found inside string literal (line:${inner_line}, column:${inner_column}, (index:${inner_index}))`);
                    } else if (strxx === '\'' && context === 'string-single' && !backslashed) {
                        context = 'outSide';
                    } else if (strxx === "\"" && context === 'string-double' && !backslashed) {
                        context = 'outSide';
                    } else if (strxx === "\\" && !backslashed) {
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
        let match = null, slice: boolean = true;
        const regexpArray = jsCode.match(/^(['"`\/])(?!\/)/);
        if (regexpArray) {
            let length: number = 0, backslashed: boolean = false,
                skip: number = 0, templateStart: boolean = false;
            type templatalExpression = ({ type: "literal" | "expression", value: string });
            const array: string[] = [], delimiter: string = regexpArray[1],
                templatalExpressions: templatalExpression[] = [];
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
                        templatalExpressions.push({type: "literal", value: array.join('')});
                        array.length = 0;
                        const addition = templatalCalculatal(jsCode, length + 1);
                        templatalExpressions.push({type: "expression", value: addition});
                        skip += addition.length + 1;
                        continue;
                    }//else {array.push(`\$`);}
                    templateStart = false;
                }
                if (/^[\\'"`\/]$/.test(strx)) {
                    if (strx === delimiter && !backslashed) {
                        break;
                    } else if (strx === '\\') {
                        backslashed = !backslashed;
                        array.push(strx);
                    } else {
                        array.push(strx);
                    }
                } else if (delimiter === '\`') {
                    if (strx === '$' && !backslashed) {
                        templateStart = true;
                        continue;
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
                backslashed = false;
            }
            if (length === 0) {
                throw new Error(`0-length String`);
            }
            jsCode = jsCode.slice(length + 1);
            const value = array.join('');
            if (delimiter === '\'' || delimiter === "\"") {
                match = {type: 'string', value, delimiter};
            } else if (delimiter === '/') {
                const flags: string = keepRegExp(/^[dgimsuvy]+/, jsCode),
                    regexp: RegExp & { toJSON?: Function } = new RegExp(value.slice(0, value.length - 1), flags);
                jsCode = jsCode.slice(flags.length);
                regexp.toJSON = regexp.toString;
                match = {type: 'RegExp', value, delimiter, flags, regexp};
            } else if (delimiter === '`') {
                // throw new Error(`Template literals not supported`);
                templatalExpressions.push({type: "literal", value: array.join('')});
                match = {
                    type: 'TemplateLiteral',
                    value: templatalExpressions.map(function (templatalExpression: templatalExpression): string {
                        if (templatalExpression.type === 'literal') {
                            return String(templatalExpression.value);
                        } else if (templatalExpression.type === 'expression') {
                            return `\${${String(templatalExpression.value)}}`;
                        } else {
                            throw new Error('templatalExpression invalid type');
                        }
                    }).join(''), delimiter, templatalExpressions
                };
            } else {
                throw new Error(`Unknown Demiliter At: \`\`\`${jsCode.slice(0, 10)}\`\`\``);
            }
            slice = false;
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
        if (slice) jsCode = jsCode.slice(match.value.length + offset);
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

        .SandboxedFunction_RegExp {
            color: #0073a6;
        }

        .SandboxedFunction__RegExp_esc {
            color: #a17d08;
        }
    </style>`.replaceAll(/SandboxedFunction_/ig,
    SandboxedFunction.SandboxedFunctionHTMLClass).replaceAll(/\s+/g, ' ');

function DeepProxy(target: any): object {
    if (new.target) {
        throw new TypeError("DeepProxy must be invoked without 'new'");
    }
    target = Object(target);
    const imaginary = new Map(); // Use a Map to handle objects with symbolic keys
    return new Proxy(target, {
        get(target: any, prop: any, receiver: unknown): any {
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
        set(_target: unknown, prop: unknown, value: unknown, _receiver: unknown): boolean {
            imaginary.set(prop, value); // Store in the imaginary object
            return true;
        },
        has(target: object, prop: string): boolean {
            return imaginary.has(prop) || Reflect.has(target, prop);
        },
        deleteProperty(_target: unknown, prop: unknown): boolean {
            if (imaginary.has(prop)) {
                imaginary.delete(prop);
                return true;
            }
            return false;
        },
        ownKeys(target: any): any[] {
            return [...new Set([...Reflect.ownKeys(target), ...imaginary.keys()])];
        },
        getOwnPropertyDescriptor(target: any, prop: any) {
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


export function typeOf(o: any, mode: number = 0): "NULL" | "Array" | "NaN" | "Date" | "RegExp" | "Promise" | "undefined" | "object" | "boolean" | "number" | "string" | "function" | "symbol" | "bigint" {
    const t = typeof o;
    const m = Math.trunc(Number(mode));
    if (o === null) {
        return (!(m & (typeOf.NULL_IsObject as number))) ? "NULL" : 'object';
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
    if (m & (typeOf.NAN_IS_NAN as number)) {
        if (Number.isNaN(o)) {
            return "NaN";
        }
    }
    if (t === 'object') {
        if (m & (typeOf.identifyRegExp as number)) {
            if (o instanceof RegExp) return "RegExp";
        }
        if (m & (typeOf.identifyDate as number)) {
            if (o instanceof Date) return "Date";
        }
        if (m & (typeOf.identifyPromise as number)) {
            if (o instanceof Promise) return "Promise";
        }
        if (m & (typeOf.identifyVia_constructor as number)) {
            const value = o;
            if (value.constructor && value.constructor.name) {
                return value.constructor.name;
            }
        }
    }
    if (t === 'undefined' && m & (typeOf.undefinedIsNULL as number)) {
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
