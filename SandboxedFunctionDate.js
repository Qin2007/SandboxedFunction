"use strict";
import { Temporal } from 'temporal-polyfill';
import { InternalSandboxedFunctionError } from "./SandboxedFunction.js";
import { calculateExpression } from "./evaluate.js";
export const SandboxedFunctionDate = function (dateScript) {
    const self = new.target ? this : Object.create(SandboxedFunctionDate.prototype);
    self.instructionTokens = SandboxedFunctionDate.__tokenize(dateScript);
    if (!new.target)
        return self;
};
SandboxedFunctionDate.__tokenize = function (dateScript) {
    let index = 0, line = 0, column = 0, dsCode = (function (string) {
        return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    })(String(dateScript));
    //keywords=/\b(?:if|else|return|function|var|let|const|for|while|true|false|null)\b/
    const fullDate = /\bF\d{4}(?:-\d{2}(?:-\d{2}(?:[Tt]\d{2}(?::\d{2}(?::\d{2}(?:\.\d{1,9})?)?)?)?)?)?(?:[+\-]\d{2}:?\d{2}|[Zz])?(?:\[[a-zA-Z]+(?:\/[a-zA-Z]+)?])?/, Instant = /\bI(?:\d{4}(?:-\d{2}(?:-\d{2}(?:[Tt]\d{2}(?::\d{2}(?::\d{2}(?:\.\d{1,9})?)?)?)?)?)?(?:[+\-]\d{2}:?\d{2}|[Zz])?(?:\[[a-zA-Z]+(?:\/[a-zA-Z]+)?])?|@\d+)/, plainDate = /\bY(?:\d{4}(?:-\d{2}(?:-\d{2})?)?)?/, plainTime = /\bT(?:\d{2}(?::\d{2}(?::\d{2})?)?)?/, plainDateTime = /\bY\d{4}(?:-\d{2}(?:-\d{2}(?:[Tt]\d{2}(?::\d{2}(?::\d{2})?)?)?)?)?(?:\[[a-zA-Z]\/[a-zA-Z]]|[+\-]\d{2}:?\d{2}|[Zz])?/, duration = /\b[+\-]?P(?:\d+Y)?(?:(?:\d+M)?(?:\d+D)?|(?:\d+W)?)(?:T(?:\d+H)?(?:\d+[IiM])?(?:\d+S(?:\.\d{,9})?)?)?/;
    const tokens = [], regexPatterns = [
        { type: "keyword", regex: /\breturn\b/, },
        { type: "comment", regex: /\/\/.*|\/\*[\s\S]*?\*\// },
        { type: "identifier", regex: /\$#?[a-zA-Z_][a-zA-Z0-9_]*\b/ },
        { type: "FullDate", regex: fullDate },
        { type: "Instant", regex: Instant },
        { type: "PlainDate", regex: plainDate },
        { type: "PlainTime", regex: plainTime },
        { type: "Duration", regex: duration },
        { type: "PlainDateTime", regex: plainDateTime },
        { type: "operator", regex: /[+\-*/=<>!&|]+/ },
        { type: "delimiter", regex: /[{}\[\]();,]/ },
        { type: "whitespace", regex: /\s+/ },
        { type: "DotAccess", regex: /\.\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
        { type: "BigInt", regex: /\b(?:0[xXoObB])?\d+n\b/ },
        { type: "number", regex: /\b(?:0[xXoObB])?\d+\b/ },
    ], keepRegExp = function (regex, string) {
        const matchArray = string.match(regex);
        return (matchArray ?? [''])[0];
    };
    while (dsCode.length > 0) {
        let match = null, slice = true;
        const regexpArray = dsCode.match(/^(['"`\/])(?!\/)/);
        if (regexpArray && !/\/\*/.test(dsCode)) {
            let length = 0, backslashed = false, skip = 0;
            const array = [], delimiter = regexpArray[1];
            for (const strx of dsCode.slice(1)) {
                if (++length > dsCode.length) {
                    throw new Error(`Unfinished String`);
                }
                if (skip > 0) {
                    skip--;
                    continue;
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
            dsCode = dsCode.slice(length + 1);
            const value = array.join('');
            if (delimiter === '\'' || delimiter === "\"") {
                match = { type: 'string', value, delimiter, index, line, column };
            }
            else if (delimiter === '/') {
                const flags = keepRegExp(/^[dgimsuvy]+/, dsCode), regexp = new RegExp(value.slice(0, value.length - 1), flags);
                dsCode = dsCode.slice(flags.length);
                regexp.toJSON = regexp.toString;
                match = { type: 'RegExp', value, delimiter, flags, regexp, index, line, column };
            }
            else {
                throw new Error(`Unknown Demiliter At: \`\`\`${dsCode.slice(0, 10)}\`\`\``);
            }
            slice = false;
        }
        else {
            for (const { type, regex } of regexPatterns) {
                const result = regex.exec(dsCode);
                if (result && result.index === 0) {
                    match = { type, value: result[0], index, line, column };
                    break;
                }
            }
        }
        if (!match) {
            throw new Error(`Unrecognized token at: \`\`\`${dsCode.slice(0, 10)}\`\`\``);
        }
        let offset = 0, string = String(match.value);
        index += string.length;
        if (/\n/.test(string)) {
            column = 0;
            line += 1;
            column += string.replace(/.+\n/, '').length;
        }
        else {
            column += string.length;
        }
        if (match.type === 'DotAccess') {
            match.value = String(match.value).replace(/^\./, '');
            offset++;
        }
        tokens.push(match);
        if (slice)
            dsCode = dsCode.slice(match.value.length + offset);
    }
    return tokens;
};
class DSFunction {
    _pathName;
    _arguments = [];
    constructor(pathName) {
        this._pathName = pathName;
    }
    addParam(argument) {
        this._arguments.push(argument);
        return this;
    }
}
const Invalid = Symbol.for('Invalid');
// const globalScope: PrototypeMap<string, Function> = new PrototypeMap<string, Function>(new Map([
// ['parseDate', function (string: string): Temporal.Instant | Invalid {
// const answer: number = Date.parse(string);if (Number.isNaN(answer)) {
// return Invalid;} else {return Temporal.Instant.fromEpochMilliseconds(answer);
// }}],]));const instantScope: PrototypeMap<string, Function> = new PrototypeMap<string, Function>(new Map([
// ['toZonedDateTime', function (this: Temporal.Instant, timezone: Temporal.TimeZoneLike): Temporal.ZonedDateTime
// {return this.toZonedDateTimeISO(timezone);}],]));
export class SandboxedFunctionSyntaxError extends InternalSandboxedFunctionError {
    constructor(message, token) {
        super(message, token.line, token.column, token.index);
    }
}
var ModeEnum;
(function (ModeEnum) {
    ModeEnum[ModeEnum["DS"] = 0] = "DS";
    ModeEnum[ModeEnum["parameterMode"] = 1] = "parameterMode";
})(ModeEnum || (ModeEnum = {}));
// export class SandboxedFunctionTypeError extends InternalSandboxedFunctionError {
//     constructor(message: string | undefined, token: instructionToken) {
// super(message, token.line, token.column, token.index);}}
export class SandboxedFunctionInternalError extends InternalSandboxedFunctionError {
    constructor(message, token) {
        super(message, token.line, token.column, token.index);
    }
}
SandboxedFunctionDate.prototype.run = function () {
    const context = {
        returned: false, variables: new Map(), contextValueChain: [],
        mode: ModeEnum.DS, ExpressionArray: [], breakloop: false,
    }, tyipf = /[TYIPF]/, invalid = Invalid;
    let index = -1, instructionToken, returnValue;
    while (instructionToken = this.instructionTokens[++index]) {
        const toParse = instructionToken.value.replace(tyipf, '');
        switch (instructionToken.type) {
            case "keyword":
                if (instructionToken.value === 'return') {
                    context.returned = true;
                }
                break;
            case "delimiter":
                if (instructionToken.value === ';' && context.returned) {
                    // return new Datetime_global(context.contextValue);
                    returnValue = context.ExpressionArray; //context.contextValueChain[context.contextValueChain.length - 1];
                    context.breakloop = true;
                }
                else if (instructionToken.value === '(' && context.contextValueChain.length > 0) {
                    const value = new DSFunction([...context.contextValueChain]);
                    context.ExpressionArray.push({ type: 'functionCall', value });
                    context.contextValueChain.length = 0;
                    context.mode = ModeEnum.parameterMode;
                }
                else if (instructionToken.value === ')') {
                    const expression = context.ExpressionArray[context.ExpressionArray.length - 1];
                    if (expression.type === 'functionCall') {
                        /*let value;
                        const function1: DSFunction = expression.toCall,
                            pathName: (string | symbol | TimeTypes)[] = expression.toCall._pathName;
                        if (pathName.length === 1) {
                            globalScope.get(<string>pathName[pathName.length - 1])?.call(undefined, function1._arguments);
                        } else if (pathName.length > 1) {
                            const twoDown: string | symbol | TimeTypes = pathName[pathName.length - 2];
                            if (twoDown instanceof Temporal.Instant) {
                                value = instantScope.get(<any>pathName[pathName.length - 1])?.call(twoDown, function1._arguments);
                            }
                        } else {
                            throw new InternalSandboxedFunctionError('there is no function here', instructionToken.line, instructionToken.column, instructionToken.index);
                        }
                        if (value === undefined) {
                            value = SandboxedFunction.__undef;
                        }*/
                        context.contextValueChain.length = 0;
                        context.mode = ModeEnum.DS;
                    }
                }
                else if (instructionToken.value === ',') {
                    const expression = context.ExpressionArray[context.ExpressionArray.length - 1];
                    if (expression.type === 'call') {
                        expression.value.addParam(context.contextValueChain);
                        context.contextValueChain.length = 0;
                    }
                }
                break;
            case "DotAccess":
                context.contextValueChain.push(instructionToken.value);
                // switch (instructionToken.value) {case "toInstant":
                //context.contextValue = context.contextValue.toInstant();}
                break;
            case "BigInt": {
                const type = "bigint", value = BigInt(instructionToken.value);
                context.ExpressionArray.push({ type, value });
                break;
            }
            case "number":
                {
                    const type = "number", value = Number(instructionToken.value);
                    context.ExpressionArray.push({ type, value });
                }
                break;
            case "operator":
                switch (instructionToken.value) {
                    case "+":
                    case "-":
                    case "*":
                    case "/":
                    case "<":
                    case ">":
                    case "!":
                        {
                            const type = "operator", value = instructionToken.value;
                            context.ExpressionArray.push({ type, value });
                        }
                        break;
                    default:
                        throw new SandboxedFunctionSyntaxError('Invalid Operator', instructionToken);
                }
                break;
            case "FullDate":
            case "Instant":
                {
                    let contextValue;
                    if (toParse.startsWith('@')) {
                        contextValue = Temporal.Instant.fromEpochNanoseconds(BigInt(toParse.slice(1)));
                    }
                    else {
                        const dateTimeRegex = /(\d{4})(-\d{2})?(-\d{2})?(?:[Tt](\d{2})(:\d{2})?(:\d{2})?(\.\d{1,9})?)?([+\-]\d{2}:?\d{2}|[Zz])?(\[[a-zA-Z]+(?:\/[a-zA-Z]+)?])?/;
                        const match = toParse.match(dateTimeRegex);
                        if (match !== null) {
                            contextValue = Temporal.Instant.from(`${match[1]}${match[2] ?? '-01'}${match[3] ?? '-01'}T${match[4] ?? '00'}${match[5] ?? ':00'}${match[6] ?? ':00'}${match[7] ?? '.000'}${match[8] ?? '+00:00'}`);
                            if (instructionToken.type === 'FullDate') {
                                contextValue = new Temporal.ZonedDateTime(contextValue.epochNanoseconds, String(match[9])
                                    .replace(/\[/, '')
                                    .replace(/]/, ''));
                            }
                        }
                        else {
                            contextValue = invalid;
                        }
                    }
                    context.contextValueChain.length = 0;
                    context.contextValueChain.push(contextValue);
                }
                break;
            case "PlainDateTime":
                {
                    const dateTimeRegex = /(\d{4})(-\d{2})?(-\d{2})?(?:[Tt](\d{2})(:\d{2})?(:\d{2})?(\.\d{1,9})?)?/;
                    const match = toParse.match(dateTimeRegex);
                    if (match !== null) {
                        context.contextValueChain.length = 0;
                        context.contextValueChain.push(Temporal.PlainDateTime.from(`${match[1]}${match[2] ?? '-01'}${match[3] ?? '-01'}T${match[4] ?? '00'}${match[5] ?? ':00'}${match[6] ?? ':00'}${match[7] ?? '.000'}`));
                    }
                    else {
                        context.contextValueChain.length = 0;
                        context.contextValueChain.push(invalid);
                    }
                }
                break;
            case "PlainTime":
                {
                    const dateTimeRegex = /(\d{2})(:\d{2})?(:\d{2})?(\.\d{1,9})?/;
                    const match = toParse.match(dateTimeRegex);
                    if (match !== null) {
                        context.contextValueChain.length = 0;
                        context.contextValueChain.push(Temporal.PlainTime.from(`${match[1] ?? '00'}${match[2] ?? ':00'}${match[3] ?? ':00'}${match[4] ?? '.000'}`));
                    }
                    else {
                        context.contextValueChain.length = 0;
                        context.contextValueChain.push(invalid);
                    }
                }
                break;
            case "PlainDate":
                {
                    const dateTimeRegex = /(\d{4})(-\d{2})(-\d{2})?/;
                    const match = toParse.match(dateTimeRegex);
                    if (match !== null) {
                        context.contextValueChain.length = 0;
                        context.contextValueChain.push(Temporal.PlainDate.from(`${match[1] ?? '00'}${match[2] ?? '-00'}${match[3] ?? '-00'}`));
                    }
                    else {
                        context.contextValueChain.length = 0;
                        context.contextValueChain.push(invalid);
                    }
                }
                break;
            case "Duration": {
                // throw new InternalSandboxedFunctionError('Duration');
                context.contextValueChain.length = 0;
                context.contextValueChain.push(Temporal.Duration.from(instructionToken.value));
                break;
            }
        }
        if (context.breakloop) {
            break;
        }
    }
    if (returnValue === undefined) {
        throw new SandboxedFunctionInternalError('returnValue is undefined', instructionToken);
    }
    const rtV = calculateExpression(returnValue);
    return { returnValue, rtV, context };
};
