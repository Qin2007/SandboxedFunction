// javascript
export const __undef = Symbol.for('__undef');
export const TemporalDeadZone = Symbol('TemporalDeadZone');
export const SandboxedFunction = function (javascript, globalObject) {
    const self = new.target ? this : Object.create(SandboxedFunction.prototype);
    self.instructionTokens = SandboxedFunction.__tokenize(javascript);
    if (globalObject !== undefined) {
        globalObject = Object.assign(defaultGlobalThis(), convertToPrototypeMap(globalObject));
    }
    self.globalObject = Object(globalObject);
    // instructionTokenList
    self.instructionTokens = applyASI(self.instructionTokens);
    // self.context = (function (this: SandboxedFunction): context {
    //     const context: context = {
    //         stage: '404', currentObject: null, functions: {}, instructionTokens: [],
    //     }, instructionTokens: instructionToken[] = this.instructionTokens;
    //     let index: number = -1;
    //     while (++index < instructionTokens.length) {
    //         const instructionToken: instructionToken = instructionTokens[index],
    //             at: string = `(line:${instructionToken.line}, column:${instructionToken.column}, (index:${instructionToken.index}))`;
    //         if (context.currentObject !== null && context.currentObject.type === 'function') {
    //             context.currentObject.asStringArray.push(instructionToken.value);
    //         } else {
    //             context.instructionTokens.push(instructionToken);
    //         }
    //         if (context.stage === 'Function.body') {
    //             if (context.currentObject === null) {
    //                 throw new InternalSandboxedFunctionError('context.currentObject is null ', instructionToken);
    //             }
    //             context.currentObject.body.push(instructionToken);
    //             if (instructionToken.type === 'delimiter' && instructionToken.value === '}') {
    //                 context.stage = '404';
    //                 context.currentObject.asString = context.currentObject.asStringArray.join('');
    //                 context.functions[context.currentObject.name] = context.currentObject;
    //                 context.currentObject.asStringArray.length = 0;
    //                 context.currentObject = null;
    //             }
    //             continue;
    //         }
    //         if (instructionToken.type === 'whitespace') {
    //             // empty
    //         } else if (instructionToken.type === 'keyword' && context.stage === '404' && instructionToken.value === 'return') {
    //
    //         } else if (instructionToken.type === 'keyword' && context.stage === '404' && instructionToken.value === 'function') {
    //             context.stage = 'Function.name';
    //             context.currentObject = {
    //                 type: 'function',
    //                 name: `Function${Date.now()}`,
    //                 parameters: [],
    //                 body: [],
    //                 asStringArray: ['function']
    //             };
    //             context.instructionTokens.pop();
    //         } else if (context.stage === 'Function.name') {
    //             if (instructionToken.type !== 'identifier') {
    //                 throw new SyntaxError(`identifier expected (got \`${instructionToken.type}\`) at ${at}`);
    //             }
    //             if (context.currentObject === null) {
    //                 throw new InternalSandboxedFunctionError('context.currentObject is null ', instructionToken);
    //             }
    //             context.currentObject.name = instructionToken.value;
    //             context.stage = 'arguments(';
    //         } else if (context.stage === 'arguments(') {
    //             if (instructionToken.type !== 'delimiter' && instructionToken.value !== '(') {
    //                 throw new SyntaxError(`\`(\` expected (got \`${instructionToken.type}\`) at ${at}`);
    //             }
    //             context.stage = 'arguments_Id';
    //         } else if (context.stage === 'arguments_Id') {
    //             if (instructionToken.value === ')') {
    //                 context.stage = 'arguments_body{';
    //                 continue;
    //             } else if (instructionToken.type !== 'identifier') {
    //                 throw new SyntaxError(`identifier expected (got \`${instructionToken.type}\`) at ${at}`);
    //             }
    //             if (context.currentObject === null) {
    //                 throw new InternalSandboxedFunctionError('context.currentObject is null ', instructionToken);
    //             }
    //             context.currentObject.parameters.push(instructionToken.value);
    //             context.stage = 'arguments,';
    //         } else if (context.stage === 'arguments,') {
    //             if (instructionToken.value === ')') {
    //                 context.stage = 'arguments_body{';
    //                 continue;
    //             }
    //             if (instructionToken.type === 'delimiter' && (instructionToken.value === ',' || instructionToken.value === ')')) {
    //                 if (instructionToken.value === ',') {
    //                     context.stage = 'arguments_Id';
    //                     continue;
    //                 }
    //             }
    //             throw new SyntaxError(`\`,\` expected (got \`${instructionToken.type}\` \`${instructionToken.value}\`) at ${at}`);
    //         } else if (context.stage === 'arguments_body{') {
    //             if (instructionToken.type === 'delimiter' && instructionToken.value === '{') {
    //                 context.stage = 'Function.body';
    //                 continue;
    //             }
    //             throw new SyntaxError(`\`{\` expected at ${at}`);
    //         }
    //     }
    //     return context;
    // }).call(self);
    //self.executableTokens = self.context.instructionTokens;
    if (!new.target)
        return self.toHTMLString();
};
// const applyASI = function (tokens: instructionToken[]): instructionToken[] {
//     const resultTokens: instructionToken[] = [], makeVirtualSemicolon = function (at: instructionToken) {
//         const index: number = at.index, line: number = at.line, column: number = at.column;
//         return ({type: "delimiter", value: ";", index, line, column, autoInserted: true,});
//     };
//     let i = 0;
//
//     // Helper to check if a token is separated by a LineTerminator
//     const hasLineTerminator = (current: instructionToken, next: instructionToken): boolean => {
//         for (let j = i; j < tokens.length - 1; j++) {
//             if (tokens[j] === current && tokens[j + 1] === next) {
//                 // Check if any token between current and next is whitespace with a newline
//                 for (let k = j; k < tokens.length && tokens[k] !== next; k++) {
//                     if (tokens[k].type === 'whitespace' && /\n/.test(tokens[k].value)) {
//                         return true;
//                     }
//                 }
//                 return false;
//             }
//         }
//         return false;
//     };
//
//     // Helper to check if a token is part of a do-while statement
//     const isDoWhileContext = (tokens: instructionToken[], index: number): boolean => {
//         // Look backward for a 'do' keyword and a 'while' keyword after the current token
//         let doFound = false;
//         for (let j = index - 1; j >= 0; j--) {
//             if (tokens[j].type === 'keyword' && tokens[j].value === 'do') {
//                 doFound = true;
//                 break;
//             }
//         }
//         if (!doFound) return false;
//         for (let j = index + 1; j < tokens.length; j++) {
//             if (tokens[j].type === 'keyword' && tokens[j].value === 'while') {
//                 return true;
//             }
//         }
//         return false;
//     };
//
//     while (i < tokens.length) {
//         const current = tokens[i];
//         const next = tokens[i + 1];
//
//         resultTokens.push(current);
//
//         // Skip ASI for whitespace and comments, but track them for LineTerminator
//         if (current.type === 'whitespace' || current.type === 'comment') {
//             i++;
//             continue;
//         }
//
//         // ASI Rule 1: Offending token
//         if (next) {
//             // Check if next token is an offending token (simplified: any token that can't follow current)
//             const isOffending = (
//                 // Tokens that typically end statements
//                 (['identifier', 'number', 'string', 'TemplateLiteral', 'RegExp', 'BigInt', 'DotAccess'].includes(current.type) &&
//                     !['operator', 'delimiter', 'DotAccess'].includes(next.type)) ||
//                 // Keywords that end statements
//                 (current.type === 'keyword' && ['return', 'break', 'continue', 'throw'].includes(current.value)) ||
//                 // Closing parenthesis in potential do-while
//                 (current.type === 'delimiter' && current.value === ')')
//             );
//
//             if (
//                 isOffending &&
//                 (
//                     // Sub-rule 1: Separated by LineTerminator
//                     hasLineTerminator(current, next) ||
//                     // Sub-rule 2: Next token is '}'
//                     (next.type === 'delimiter' && next.value === '}') ||
//                     // Sub-rule 3: After ')' in do-while context
//                     (current.type === 'delimiter' && current.value === ')' && isDoWhileContext(tokens, i))
//                 )
//             ) {
//                 resultTokens.push(makeVirtualSemicolon(current));
//             }
//         }
//
//         // ASI Rule 2: End of input
//         if (!next && ['identifier', 'number', 'string', 'TemplateLiteral', 'RegExp', 'BigInt', 'DotAccess'].includes(current.type)) {
//             resultTokens.push(makeVirtualSemicolon(current));
//         }
//
//         // ASI Rule 3: Restricted productions (e.g., [no LineTerminator here])
//         if (next && (
//             // After return, break, continue, throw
//             (current.type === 'keyword' && ['return', 'break', 'continue', 'throw'].includes(current.value)) ||
//             // After postfix ++/--
//             (current.type === 'operator' && ['++', '--'].includes(current.value))
//         )) {
//             if (hasLineTerminator(current, next)) {
//                 resultTokens.push(makeVirtualSemicolon(current));
//             }
//         }
//
//         i++;
//     }
//
//     // Filter out whitespace and comment tokens if not needed in final output
//     return resultTokens//.filter(token => token.type !== 'whitespace' && token.type !== 'comment');
// };
const applyASI = function (instructionTokens) {
    const instructionTokenList = [], makeVirtualSemicolon = function (at) {
        const index = at.index, line = at.line, column = at.column;
        return ({ type: "delimiter", value: ";", index, line, column, autoInserted: true, });
    }, /* isStatementTerminated = function (currentIndex: number): boolean {
        let semicolonEncountered: boolean = false;
        for (const instructionToken of instructionTokens.slice(0, currentIndex + 1).reverse()) {
            semicolonEncountered = (instructionToken.type === "delimiter" && instructionToken.value === ';') || semicolonEncountered;
        }
        return semicolonEncountered;
    }, nextNonWhitespace = function (currentIndex: number): number {
        let index: number = currentIndex;
        for (const instructionToken of instructionTokens.slice(currentIndex)) {
            if (instructionToken.type !== "whitespace") {
                return index;
            }
            index++;
        }
        return NaN;
    },*/ bracketStack = [], testIsLiteral = function (instructionToken) {
        return 'string,number,BigInt,RegExp,TemplateLiteral,operator'.split(/,/g).includes(instructionToken.type) ||
            (instructionToken.type === "keyword" && /^(?:true|false|null|typeof|void|yield|this|new)$/.test(instructionToken.value));
    }, variables = new Map();
    let i = -1, instructionToken, declWith = undefined, // lastInsertedSemicolon: number = i,
    expectationStage = 'statement';
    while (instructionToken = instructionTokens[++i]) {
        const current = instructionToken, next = instructionTokens[i + 1];
        // Rule 2: Before a closing }
        if (instructionToken.type === "delimiter" && instructionToken.value === '}') {
            instructionTokenList.push(makeVirtualSemicolon(current), instructionToken);
            continue;
        }
        if (instructionToken.type === "delimiter" && instructionToken.value === ';') {
            if (bracketStack.length > 0) {
                throw SandboxedFunctionSyntaxError.fromInstructionToken('brackets arent closed', instructionToken);
            }
            // lastInsertedSemicolon = i;
        }
        else if (instructionToken.type === "delimiter" && instructionToken.value === '{') {
            bracketStack.push('block');
        }
        if (testIsLiteral(instructionToken)) {
            expectationStage = "expressionStatement";
        }
        if (instructionToken.type === "keyword" && instructionToken.value === 'var' || instructionToken.value === 'let' || instructionToken.value === 'const') {
            if (expectationStage !== 'statement') {
                expectationStage = "vari-name";
                declWith = instructionToken.value;
                instructionTokenList.push(instructionToken);
                continue;
            }
        }
        if (expectationStage === 'vari-name') {
            if (instructionToken.type !== "identifier") {
                throw SandboxedFunctionSyntaxError.fromInstructionToken('after let, const, or var avariable  name must be provided', instructionToken);
            }
            if (declWith === 'var') {
                variables.set(instructionToken.value, __undef);
            }
            else {
                variables.set(instructionToken.value, TemporalDeadZone);
            }
            instructionTokenList.push(instructionToken);
            expectationStage = 'expression';
            continue;
        }
        if (instructionToken.type === "whitespace" && instructionToken.value.includes('\n') && next) {
            if (testIsLiteral(next)) {
                expectationStage = 'statement';
                // lastInsertedSemicolon = i;
            }
        }
        // if (instructionToken.type === "whitespace" && instructionToken.value.includes('\n') && !isStatementTerminated(i))
        // {const the_nextNonWhitespace = nextNonWhitespace(i);if (!Number.isNaN(the_nextNonWhitespace)) {
        // if (!'[+-*/.('.split(new RegExp('')).includes(instructionTokens[the_nextNonWhitespace].value)) {
        // instructionTokenList.push(makeVirtualSemicolon(current), instructionToken);continue;}}}
        instructionTokenList.push(instructionToken);
        // Rule 1: Line break after return/break/continue/throw
        if (current.type === "keyword" && ["return", "break", "continue", "throw"].includes(current.value)) {
            if (next && next.value.includes('\n')) {
                instructionTokenList.push(makeVirtualSemicolon(next));
            }
        }
    }
    const nan = { index: NaN, line: NaN, column: NaN }, last_instructionToken = instructionTokenList.at(-1) ?? nan, index = last_instructionToken.index, line = last_instructionToken.line, column = last_instructionToken.column;
    instructionTokenList.push({
        type: "delimiter", value: ";", index,
        line, column, autoInserted: true,
    });
    instructionTokenList.forEach(t => console.log(t));
    return instructionTokenList; //{instructionTokenList, variables};
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
                if (instructionToken.value === ';' && instructionToken.autoInserted) {
                    result.push(`<span class=${id}autoIns>;</span>`);
                    break;
                }
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
SandboxedFunction.__undef = __undef;
SandboxedFunction.__tokenize = function (javascript) {
    let index = 0, line = 0, column = 0, jsCode = (function (string) {
        return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    })(String(javascript));
    //keywords=/\b(?:if|else|return|function|var|let|const|for|while|true|false|null)\b/
    const keywords = /\b(?:if|else|switch|case|default|for|while|do|break|continue|return|throw|try|catch|finally|var|let|const|function|class|extends|super|this|new|delete|import|export|from|static|true|false|null|typeof|instanceof|void|yield|with|debugger|in|of)\b/, number = /^[+-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+$/;
    //=/^[+-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+$/
    const tokens = [], regexPatterns = [
        { type: "keyword", regex: keywords, },
        { type: "comment", regex: /\/\/.*|\/\*[\s\S]*?\*\// },
        { type: "identifier", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
        // {type: "number", regex: /\b\d+(\.\d+)?\b/},
        { type: "number", regex: number },
        { type: "operator", regex: /[+\-*/=<>!&|?:]+/ },
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
                throw new SandboxedFunctionSyntaxError(`Unknown Demiliter At: \`\`\`${jsCode.slice(0, 10)}\`\`\``, index, line, column);
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
            throw new SandboxedFunctionSyntaxError(`Unrecognized token at: \`\`\`${jsCode.slice(0, 10)}\`\`\``, index, line, column);
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
// SandboxedFunction.style = SandboxedFunction.styletag = `<style>
//         .SandboxedFunction_outerHTML {
//             background-color: lightgray;
//             border: 1px solid darkgray;
//             color: black;
//             margin: 1em 0;
//             padding: 0.2em;
//         }
//         .SandboxedFunction_Black {
//             color: black;
//         }
//
//         .SandboxedFunction_string {
//             color: darkgreen;
//         }
//
//         .SandboxedFunction_keyword, .SandboxedFunction_backslash {
//             color: #D66100;
//         }
//
//         .SandboxedFunction_Identifier {
//             color: #986e09;
//         }
//
//         .SandboxedFunction_RegExp, .SandboxedFunction_BigInt, .SandboxedFunction_Number {
//             color: #0073a6;
//         }
//
//         .SandboxedFunction__RegExp_esc {
//             color: #a17d08;
//         }
//     </style>`.replaceAll(/SandboxedFunction_/ig,
//     SandboxedFunction.SandboxedFunctionHTMLClass).replaceAll(/\s+/g, ' ');
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
            color: #4caf50;
        }

        .SandboxedFunction_keyword {
            color: #1a73e8;
        }

        .SandboxedFunction_backslash {
            color: #986e09;
        }

        .SandboxedFunction_Identifier {
            color: #e91e63;
        }

        .SandboxedFunction_RegExp, .SandboxedFunction_BigInt, .SandboxedFunction_Number {
            color: #f44336;
        }

        .SandboxedFunction__RegExp_esc {
            color: #a17d08;
        }
        .SandboxedFunction_autoIns {
            color: blueviolet;
        }
    </style>`.replaceAll(/SandboxedFunction_/ig, SandboxedFunction.SandboxedFunctionHTMLClass).replaceAll(/\s+/g, ' ');
function convertToPrototypeMap(obj, prototype) {
    const ensurePrototypeMap = function (proto) {
        if (proto === null)
            return null;
        if (proto instanceof PrototypeMap)
            return proto;
        throw new TypeError("Provided prototype must be a PrototypeMap or null");
    };
    const toPrototypeMap = function (source, fallbackProto) {
        const map = new Map();
        for (const key of Reflect.ownKeys(source)) {
            map.set(key, Reflect.get(source, key));
        }
        return new PrototypeMap(map, fallbackProto);
    };
    if (prototype !== undefined) {
        // Explicit prototype provided (either null or valid PrototypeMap)
        return toPrototypeMap(obj, ensurePrototypeMap(prototype));
    }
    // No explicit prototype — walk the object's prototype chain
    let lastMap = null;
    let current = obj;
    while (current && current !== Object.prototype) {
        lastMap = toPrototypeMap(current, lastMap);
        current = Object.getPrototypeOf(current);
    }
    return lastMap ?? new PrototypeMap();
}
export class SandboxedFunctionError extends Error {
    constructor(message, token) {
        super(`${message}; at(line:${token.line}, column:${token.column}, ${token.index})`);
    }
}
export class InternalSandboxedFunctionError extends SandboxedFunctionError {
}
export class SandboxedFunctionSyntaxError extends Error {
    constructor(message, line, column, index) {
        super(`${message}; at(line:${line}, column:${column}, ${index})`);
    }
    static fromInstructionToken(message, token) {
        return new SandboxedFunctionSyntaxError(message, token.line, token.column, token.index);
    }
}
class Scope extends Array {
    variables;
    constructor() {
        super();
        this.variables = new PrototypeMap;
    }
}
SandboxedFunction.prototype.run = function (..._parameters) {
    let index = -1, instructionToken, map;
    const scope = new Scope(), varhoistedScope = scope, runContext = { stage: "404", objectChain: [], };
    while (instructionToken = this.context.instructionTokens[++index]) {
        switch (instructionToken.type) {
            case "identifier":
                if (runContext.stage === 'var-decl') {
                    if (map === undefined) {
                        throw new InternalSandboxedFunctionError('map is undefined', instructionToken);
                    }
                    map.set(instructionToken.value, SandboxedFunction.__undef);
                }
                else if (runContext.stage.endsWith('-decl')) {
                    if (map === undefined) {
                        throw new InternalSandboxedFunctionError('map is undefined', instructionToken);
                    }
                    map.set(instructionToken.value, SandboxedFunction.TemporalDeadZone);
                }
                break;
            // case "DotAccess":
            //     runContext.objectChain.push(instructionToken);
            //     break;
            // case "delimiter":
            //     if (instructionToken.value === "(" && runContext.objectChain.length > 0) {
            //
            //     }
            //     break;
            case "keyword":
                if ('let, const, class'.split(/, ?/g).includes(instructionToken.value)) {
                    runContext.stage = `${instructionToken.value}-decl`;
                    map = scope.variables;
                }
                else if (instructionToken.value === 'var') {
                    runContext.stage = `var-decl`;
                    map = varhoistedScope.variables;
                }
                break;
        }
    }
    return { context: this.context, runContext, map };
};
// function DeepProxy(target: any): object {
//     if (new.target) {
//         throw new TypeError("DeepProxy must be invoked without 'new'");
//     }
//     target = Object(target);
//     const imaginary = new Map(); // Use a Map to handle objects with symbolic keys
//     return new Proxy(target, {
//         get(target: any, prop: any, receiver: unknown): any {
//             if (imaginary.has(prop)) {
//                 return imaginary.get(prop);
//             }
//             const value = Reflect.get(target, prop, receiver);
//             // Wrap nested objects in a new DeepProxy
//             if (typeOf(value, typeOf.functionsAreObjects) === 'object') {
//                 return DeepProxy(value); // Recursive wrapping
//             }
//             return value;
//         },
//         set(_target: unknown, prop: unknown, value: unknown, _receiver: unknown): boolean {
//             imaginary.set(prop, value); // Store in the imaginary object
//             return true;
//         },
//         has(target: object, prop: string): boolean {
//             return imaginary.has(prop) || Reflect.has(target, prop);
//         },
//         deleteProperty(_target: unknown, prop: unknown): boolean {
//             if (imaginary.has(prop)) {
//                 imaginary.delete(prop);
//                 return true;
//             }
//             return false;
//         },
//         ownKeys(target: any): any[] {
//             return [...new Set([...Reflect.ownKeys(target), ...imaginary.keys()])];
//         },
//         getOwnPropertyDescriptor(target: any, prop: any) {
//             if (imaginary.has(prop)) {
//                 return {
//                     configurable: true,
//                     enumerable: true,
//                     value: imaginary.get(prop),
//                     writable: true,
//                 };
//             }
//             return Reflect.getOwnPropertyDescriptor(target, prop);
//         },
//     });
// }
function defaultGlobalThis() {
    const global = new Map();
    // Basic value constructors
    global.set("Number", Number);
    global.set("String", String);
    global.set("Boolean", Boolean);
    global.set("Symbol", Symbol);
    global.set("BigInt", BigInt);
    global.set("Date", Date);
    global.set("RegExp", RegExp);
    global.set("Error", Error);
    global.set("Math", Object.create(Math)); // prevent mutations on global Math
    global.set("JSON", Object.create(JSON));
    global.set("SandboxedFunction", Object.create(SandboxedFunction));
    // Typed Arrays
    global.set("Int8Array", Int8Array);
    global.set("Uint8Array", Uint8Array);
    global.set("Uint8ClampedArray", Uint8ClampedArray);
    global.set("Int16Array", Int16Array);
    global.set("Uint16Array", Uint16Array);
    global.set("Int32Array", Int32Array);
    global.set("Uint32Array", Uint32Array);
    global.set("Float32Array", Float32Array);
    global.set("Float64Array", Float64Array);
    global.set("BigInt64Array", BigInt64Array);
    global.set("BigUint64Array", BigUint64Array);
    // Utility classes
    global.set("Map", Map);
    global.set("Set", Set);
    global.set("WeakMap", WeakMap);
    global.set("WeakSet", WeakSet);
    global.set("Object", Object);
    global.set("Function", Function);
    global.set("Reflect", Reflect);
    global.set("Proxy", Proxy);
    global.set("Promise", Promise);
    // Globals
    global.set("Infinity", Infinity);
    global.set("NaN", NaN);
    global.set("undefined", undefined);
    global.set("parseInt", parseInt);
    global.set("parseFloat", parseFloat);
    global.set("isFinite", isFinite);
    global.set("isNaN", isNaN);
    global.set("encodeURI", encodeURI);
    global.set("decodeURI", decodeURI);
    global.set("encodeURIComponent", encodeURIComponent);
    global.set("decodeURIComponent", decodeURIComponent);
    global.set("console", Object.create(console)); // safe console
    return new PrototypeMap(global, null);
}
export class PrototypeMap {
    map;
    #prototype = null;
    constructor(map = undefined, prototype = undefined) {
        if (map === undefined)
            map = new Map();
        if (!(map instanceof Map)) {
            throw new TypeError("First argument must be a Map.");
        }
        prototype = prototype ?? null;
        if (prototype !== null && !(prototype instanceof PrototypeMap)) {
            throw new TypeError("Second argument must be a PrototypeMap or null.");
        }
        this.map = map;
        this.#prototype = prototype;
    }
    valueOf() {
        return this.map;
    }
    toString() {
        return this.map.toString();
    }
    toJSON() {
        const map = this.map;
        const string = {};
        for (const [entry, value] of map.entries()) {
            if (typeof entry === 'symbol') {
                string[entry] = value;
            }
            else {
                string[String(entry)] = value;
            }
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
        this.map.set(key, value);
        return this;
    }
    get(key) {
        if (this.map.has(key)) {
            return this.map.get(key);
        }
        return this.#prototype ? this.#prototype.get(key) : undefined;
    }
    hasOwn(key) {
        return this.map.has(key);
    }
    setPrototypeTo(prototype) {
        if (!(prototype instanceof PrototypeMap) && prototype !== null) {
            throw new TypeError("Argument must be a PrototypeMap or null.");
        }
        if (prototype === this || (prototype && this.hasPrototype(prototype))) {
            throw new Error("Circular prototype chain detected.");
        }
        this.#prototype = prototype;
        return this;
    }
    getPrototype() {
        return this.#prototype;
    }
    static create(prototype) {
        if (!(prototype instanceof PrototypeMap) && prototype !== null) {
            throw new TypeError("Argument must be a PrototypeMap or null.");
        }
        return new PrototypeMap(new Map(), prototype);
    }
    get [Symbol.toStringTag]() {
        return 'PrototypeMap';
    }
    hasPrototype(target) {
        let current = this.#prototype;
        const seen = new Set();
        while (current && !seen.has(current)) {
            if (current === target)
                return true;
            seen.add(current);
            current = current.getPrototype();
        }
        return false;
    }
}
const SandboxedFunctionWrapper_prototypeMap = new PrototypeMap(new Map());
export class SandboxedFunctionWrapper extends PrototypeMap {
    wrappedFunction;
    constructor(wrappedFunction) {
        super(new Map, SandboxedFunctionWrapper_prototypeMap);
        if (wrappedFunction instanceof Function) {
            this.wrappedFunction = wrappedFunction;
        }
        else if (wrappedFunction instanceof SandboxedFunction) {
            this.wrappedFunction = wrappedFunction;
        }
        else if (wrappedFunction instanceof SandboxedFunctionWrapper) {
            this.wrappedFunction = wrappedFunction.getWrappedFunction();
        }
        else {
            throw new TypeError('wrappedFunction must be a Function, SandboxedFunction, or SandboxedFunctionWrapper');
        }
    }
    getWrappedFunction() {
        return this.wrappedFunction;
    }
}
// function evaluateExpression(tokens: instructionToken[], scope: Record<string, any>): any {
//     let index = 0;
//
//     function next(): instructionToken | undefined {
//         return tokens[index++];
//     }
//
//     // function peek(): instructionToken | undefined {return tokens[index];}
//
//     const stack: any[] = [];
//     while (index < tokens.length) {
//         const token = next();
//         if (token === undefined) break;
//         switch (token.type) {
//             case 'number':
//                 stack.push(Number(token.value));
//                 break;
//             case 'BigInt':
//                 stack.push(BigInt(token.value.slice(0, -1)));
//                 break;
//             case 'string':
//                 stack.push(token.value);
//                 break;
//             case 'identifier':
//                 if (!(token.value in scope)) throw new ReferenceError(`Variable ${token.value} is not defined`);
//                 stack.push(scope[token.value]);
//                 break;
//             case 'operator':
//                 const right = stack.pop();
//                 const left = stack.pop();
//                 switch (token.value) {
//                     case '+':
//                         stack.push(left + right);
//                         break;
//                     case '-':
//                         stack.push(left - right);
//                         break;
//                     case '*':
//                         stack.push(left * right);
//                         break;
//                     case '/':
//                         stack.push(left / right);
//                         break;
//                     default:
//                         throw new Error(`Unsupported operator: ${token.value}`);
//                 }
//                 break;
//             default:
//                 throw new Error(`Unsupported token in expression: ${token.type}`);
//         }
//     }
//
//     if (stack.length !== 1) {
//         throw new Error(`Invalid expression`);
//     }
//
//     return stack[0];
// }
export function toNumeric(value, type = null) {
    // Handle object conversion
    if (typeof value === 'object' && value !== null) {
        // Try Symbol.toPrimitive
        if (typeof value[Symbol.toPrimitive] === 'function') {
            value = value[Symbol.toPrimitive]('number');
            if (typeof value !== 'object' || value === null) {
                // Continue with primitive
            }
            else {
                throw new TypeError('Cannot convert object to primitive value');
            }
        }
        else {
            let temp;
            if (value.valueOf !== undefined) {
                temp = value.valueOf();
            }
            if (typeof temp === 'object' && temp !== null) {
                if (value.toString !== undefined) {
                    temp = value.toString();
                }
                if (typeof temp === 'object' && temp !== null) {
                    throw new TypeError('Cannot convert object to primitive value');
                }
            }
            value = temp;
            // // Try valueOf
            // let temp = value.valueOf();
            // if (typeof temp !== 'object' || temp === null) {
            //     value = temp;
            // } else {
            //     // Try toString
            //     temp = value.toString();
            //     if (typeof temp !== 'object' || temp === null) {
            //         value = temp;
            //     } else {
            //         throw new TypeError('Cannot convert object to primitive value');
            //     }
            // }
        }
    }
    // At this point, value should be a primitive
    if (type === 'Number') {
        return +value; // Unary plus, let errors propagate
    }
    else if (type === 'BigInt') {
        try {
            return BigInt(value);
        }
        catch (e) {
            if (e instanceof TypeError) {
                throw e; // Rethrow TypeError
            }
            else if (e instanceof SyntaxError) {
                return null; // Return null for SyntaxError
            }
            throw e; // Rethrow other errors
        }
    }
    else {
        // Default case: return BigInt as-is, others get unary plus
        if (typeof value === 'bigint') {
            return value;
        }
        return +value; // Unary plus, let errors propagate
    }
}
