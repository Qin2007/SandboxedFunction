//calculateExpression
import {Temporal} from "temporal-polyfill";
import {Datetime_global} from "datetime_global/Datetime_global.js";

export const __undef: symbol = Symbol.for('__undef');
export type __undef = typeof __undef;
export type plainTemporalTypes =
    Temporal.PlainDate
    | Temporal.PlainDateTime
    | Temporal.PlainTime
    | Temporal.PlainMonthDay
    | Temporal.PlainYearMonth;
export type TemporalTypes = plainTemporalTypes | Temporal.ZonedDateTime | Temporal.Instant | Temporal.Duration;
export type TimeTypes = TemporalTypes | Datetime_global | Date;
export type DSType = string | symbol | TimeTypes | number | bigint;

export const Invalid: symbol = Symbol.for('Invalid');
export type Invalid = typeof Invalid;

export class SBFunction {
    public _pathName: (string | symbol | TimeTypes)[];
    public _arguments: (string | symbol | TimeTypes | SBFunction | expressionArray | Array<DSType>)[] = [];

    constructor(pathName: (string | symbol | TimeTypes)[]) {
        this._pathName = pathName;
    }

    addParam(argument: string | symbol | TimeTypes | SBFunction | Array<DSType>): this {
        this._arguments.push(argument);
        return this;
    }
}

export type expressionArray =
    | { type: 'undefined', value: typeof __undef }
    | { type: 'number', value: number }
    | { type: 'string', value: string }
    | { type: 'plainFunctionCall', value: Function }
    | { type: 'SBFunctionCall', value: SBFunction }
    | { type: 'bigint', value: bigint }
    | { type: 'operator', value: string };

export function calculateExpression(expressionArray: expressionArray[], throwIfEmpty: number = 0/*, selfObject = undefined*/) {
    if (!Array.isArray(expressionArray)) {
        throw new TypeError('expressionArray must be an array');
    }
    if (!(expressionArray.length > 0)) {
        if ((throwIfEmpty & calculateExpression.throwIfEmpty) !== 0) {
            throw new Error('calculateExpression was send an empty expressionArray');
        } else if ((throwIfEmpty & calculateExpression.warnIfEmpty) !== 0) {
            console.warn('calculateExpression was send an empty expressionArray');
        }// if (throwIfEmpty & calculateExpression.undefinedIfEmpty) // do nothing
        return {type: 'undefined', 'value': undefined};
    } else if (!expressionArray.every(function (element) {
        return element !== undefined && Object(element)['type'] !== 'undefined';
    })) {
        if ((throwIfEmpty & calculateExpression.throwIfEmpty) !== 0) {
            throw new Error('calculateExpression was send an empty (or an array with only undefined) expressionArray');
        } else if ((throwIfEmpty & calculateExpression.warnIfEmpty) !== 0) {
            console.warn('calculateExpression was send an empty (or an array with only undefined) expressionArray');
        }
    }

    function make_2side_calculation(operators: string[], expressionArray_: expressionArray[]): expressionArray[] {
        let index: number, operator: string | undefined;
        while ((index = expressionArray_.findIndex(function (element: expressionArray): boolean {
            const object = Object(element);
            if (object['type'] === 'operator') {
                const inArray = operators.includes(object['value']);
                if (inArray) operator = object['value'];
                return inArray;
            } else {
                return false;
            }
        })) >= 0) {
            const H: expressionArray = expressionArray_[index];
            const L: expressionArray = expressionArray_[index - 1];
            const R: expressionArray = expressionArray_[index + 1];
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
            if (L.type === 'number' && R.type === 'number') {
                const L_value: number = L['value'], R_value: number = R['value'];
                expressionArray_[index - 1] = {
                    type: 'number', value: (function (): number {
                        switch (operator) {
                            case'/':
                                return L_value / R_value;
                            case'*':
                                return L_value * R_value;
                            case'**':
                                return L_value ** R_value;
                            case'+':
                                return L_value + R_value;
                            case'-':
                                return L_value - R_value;
                            case'%':
                                return L_value & R_value;
                            default:
                        }
                        throw new Error(`operator "${operator}" not supported`);
                    })(),
                };
                expressionArray_.splice(index, 2);
            } else if (L.type === 'string' && R.type === 'string') {
                const L_value: string = L['value'], R_value: string = R['value'];
                expressionArray_[index - 1] = {
                    type: 'string', value: (function () {
                        switch (operator) {
                            case'+':
                                return L_value + R_value;
                            case'-':
                            default:
                        }
                        throw new Error(`operator "${operator}" not supported`);
                    })(),
                };
                expressionArray_.splice(index, 2);
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
        // @ts-ignore
        expressionArray[index] = calculateExpression([expressionArray[index]], throwIfEmpty);
    }
    // functionCalls.js
    while ((index = expressionArray.findIndex(function (element: expressionArray) {
        return Object(element)['type'] === 'plainFunctionCall' || Object(element)['type'] === 'SBFunctionCall';
    })) >= 0) {
        const type: 'plainFunctionCall' | 'SBFunctionCall' | string = expressionArray[index].type;
        let theActualFunction = expressionArray[index].value, called: boolean = false, returnV: any;
        if (typeof theActualFunction === 'function') {
            // returnV = theActualFunction(theActualFunction._arguments);
            // called = true;
            throw new Error(`expressionArray[${index}] is not a present`);
        } else if (type === 'SBFunctionCall' && theActualFunction instanceof SBFunction) {
            returnV = theActualFunction.run(theActualFunction._arguments);
            called = true;
        }
        // if (typeOf(theActualFunction) === 'function') {
        //     theActualFunction = theActualFunction.value;//.target;
        //     const parameters = expressionArray[index].parameters;
        //     const theArguments = {length: parameters.length, parameters: parameters};
        //     const insertion = theArguments.length === 0 ? {length: 0, parameters: []} : {
        //         parameters: [calculateExpression([...expressionArray[index].parameters], throwIfEmpty)],
        //     };
        //     insertion.length = insertion.parameters.length;
        //     //if (theActualFunction instanceof Function) {
        //     //     expressionArray[index] = theActualFunction(insertion, selfObject);
        //     // } else {
        //     //     console.error(theActualFunction);
        //     //throw new Error(`${Object(theActualFunction).constructor.name} is not a function`);}
        //     throw new Error(`functions not supported`);
        // } else {
        //     console.error(theActualFunction);
        //     throw new Error(`expressionArray[${index}] is not a present`);
        // }
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

export function assert(statement: any, assertionId: string = 'unknown assertion') {
    if (!Boolean(statement)) {
        throw new Error(`(${String(assertionId)}) wasn't truthy`);
    }
    return statement;
}

export function typeOf(o: any, mode = 0): "NULL" | "Array" | "NaN" | "Date" | "RegExp" | "Promise" | "undefined" | "object" | "boolean" | "number" | "string" | "function" | "symbol" | "bigint" {
    const t = typeof o;
    const m = Math.trunc(Number(mode));
    if (o === null) {
        return (!((m & typeOf.NULL_IsObject) === typeOf.NULL_IsObject)) ? "NULL" : 'object';
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
    if ((m & typeOf.NAN_IS_NAN) === typeOf.NAN_IS_NAN) {
        if (Number.isNaN(o)) {
            return "NaN";
        }
    }
    if (t === 'object') {
        if ((m & typeOf.identifyRegExp) === typeOf.identifyRegExp) {
            if (o instanceof RegExp) return "RegExp";
        }
        if ((m & typeOf.identifyDate) === typeOf.identifyDate) {
            if (o instanceof Date) return "Date";
        }
        if ((m & typeOf.identifyPromise) === typeOf.identifyPromise) {
            if (o instanceof Promise) return "Promise";
        }
    }
    if (t === 'undefined' && ((m & typeOf.undefinedIsNULL) === typeOf.undefinedIsNULL)) {
        return 'NULL';
    }
    return t;
}

// typeOf.identifyVia_constructor = 64;
typeOf.checkArraySeperately = 1;
typeOf.functionsAreObjects = 2;
typeOf.undefinedIsNULL = 256;
typeOf.identifyPromise = 32;
typeOf.NULL_IsObject = 128;
typeOf.identifyRegExp = 8;
typeOf.identifyDate = 16;
typeOf.NAN_IS_NAN = 4;
