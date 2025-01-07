// php
function SandboxedFunctionPHP(php, insertions) {
    let __tokens;
    if ('tokens' in Object(php)) {
        __tokens = php.tokens;
    } else {
        __tokens = SandboxedFunctionPHP.__tokenize(php);
    }
    if (!new.target) {
        //called without new
        return __tokens;
    }
    this.tokens = __tokens;
}

SandboxedFunctionPHP.prototype.run = function () {
    let tokenIndex = 0;
    const context = {
        outputBuffers: [new __ObjectBufferPHP()],
        outPutString: [],
        stage: '404', expressionFor: null,
        operations: [], print: function (string) {
            this.outputBuffers[this.outputBuffers.length - 1].append(string);
        }, PARENTheses: [],
    };
    let operations = context.operations;
    context.PARENTheses.push(operations);
    while (tokenIndex < this.tokens.length - 1) {
        const token = this.tokens[++tokenIndex];
        switch (token.type) {
            case"phpTags":
                if (token.value === '<?=') {
                    context.stage = 'expression';
                    context.expressionFor = 'echo';
                }
                break;
            case"keyword":
                switch (token.value) {
                    case"echo":
                        context.stage = 'expression';
                        context.expressionFor = 'echo';
                }
                break;
            case"string":
                if (context.stage === 'expression') {
                    operations.push({type: 'string', value: token.value.slice(1, -1)});
                }
                break;
            case"number":
                const n = parseNumber(token.value, parseNumber.disallowNaN);
                if (context.stage === 'expression') {
                    operations.push({type: 'number', value: n});
                }
                break;
            case"operator":
                if (context.stage === 'expression') {
                    operations.push({type: 'operator', value: token.value});
                }
                break;
            case"parentheses":
                if (context.stage === 'expression') {
                    if (token.value === '(') {
                        const array = [];
                        operations.push(array);
                        operations = array;
                        context.PARENTheses.push(array);
                    } else if (token.value === ')') {
                        context.PARENTheses.pop();
                        if ((operations = context.PARENTheses[context.PARENTheses.length - 1]) === undefined) {
                            throw new SyntaxError('mismatched PARENTheses'.toLowerCase());
                        }
                    }
                }
                break;
            case "semicolon":
                const result = this.calculateExpression(context.operations);
                // context.print(JSON.stringify({
                //     context_operations: JSON.parse(context_operations), result
                // }, null, 2));
                if (context.stage === 'expression' && context.expressionFor === 'echo') {
                    context.print(result.value);
                }
                break;
            default:
        }
    }
    const array = context.outputBuffers.map(function (element) {
        return element.toString();
    });
    return context.outPutString.join('') + array.join('');
};
SandboxedFunctionPHP.__tokenize = function (phpCode) {
    phpCode = normalize_newlines(String(phpCode));
    const regexPatterns = [
        {type: 'phpTags', regex: /<\?(?:php|=)|\?>/},
        {
            type: "keyword",
            regex: /\b(__halt_compiler\(\)|abstract|and|array\(\)|as|break|callable|case|catch|class|clone|const|continue|declare|default|die\(\)|do|echo|else|elseif|empty\(\)|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval\(\)|exit\(\)|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset\(\)|list\(\)|match|namespace|new|or|print|private|protected|public|readonly|require|require_once|return|static|switch|throw|trait|try|unset\(\)|use|var|while|xor|yield)\b/i
        },
        {type: "comment", regex: /\/\/(?:(?!\?>).)*|\/\*[\s\S]*?\*\//},
        {type: 'variable', regex: /\$[a-zA-Z_][a-zA-Z0-9_]*/},
        {type: 'semicolon', regex: /;|\?>/},
        {type: "whitespace", regex: /\s+/},
        {type: "parentheses", regex: /[\[\]()]/},
        {type: "number", regex: /[+\-]?\b\d+(\.\d+)?\b/},
        {type: 'operator', regex: /[!+\-=|<>.\/:~?*&^%]+/},
    ];
    //let line = 0, token = 0;
    const tokens = [];
    let inPHPMode = false;
    while (phpCode.length > 0) {
        let match = null;
        for (const {type, regex} of regexPatterns) {
            if (inPHPMode === false) {
                const regexpResult = /<\?(?:php|=)/.exec(phpCode);
                if (regexpResult) {
                    const index = regexpResult.index;
                    tokens.push({type: 'string', value: phpCode.slice(0, index), phptags: 'Symbol'});
                    match = {type: 'phpTags', value: regexpResult[0], phptags: 'Symbol'};
                    phpCode = phpCode.slice(index);
                    inPHPMode = true;
                    break;
                } else {
                    // probably a giant string (must be a giant string)
                    return [{type: 'string', value: phpCode}];
                }
            } else {
                const result = regex.exec(phpCode);
                if (result && result.index === 0) {
                    match = {type, value: result[0]};
                    break;
                } else if (/['"]/.test(phpCode[0])) {
                    const stringQuote = phpCode[0];
                    let tokenLocation = 0;
                    while (phpCode[++tokenLocation] !== stringQuote && tokenLocation < phpCode.length) {
                    }
                    if (tokenLocation >= phpCode.length) {
                        throw new Error('String exceeds code string');
                    }
                    match = {type: 'string', value: phpCode.substring(0, tokenLocation + 1)};
                    break;
                }
            }
        }
        if (!match) {
            throw new Error(`Unrecognized token at: \`\`\`${phpCode.slice(0, 10)}\`\`\``);
        }
        tokens.push(match);
        phpCode = phpCode.slice(match.value.length);
        if (match.type === 'semicolon' && match.value === '?>') {
            inPHPMode = false;
        }
    }

    return tokens;
};
SandboxedFunctionPHP.prototype.calculateExpression = calculateExpression;

function __ObjectBufferPHP() {
    this.array = [];
}

__ObjectBufferPHP.prototype.append = function (string) {
    this.array.push(String(string));
};

__ObjectBufferPHP.prototype.toString = function () {
    return this.array.join('');
};