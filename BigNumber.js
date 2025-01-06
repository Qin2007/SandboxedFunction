"use strict";
// BigInt?
function equals_undefined($any) {
    return $any === undefined || $any === null;
}
class BigNumber {
    int = 0n;
    Float = 0;
    sign = '+';
    constructor(any, float) {
        const $any = any;
        let dont_change_the_sign = Boolean();
        if ((typeof any) === 'symbol')
            throw new Error('Symbol() has been explicitly disallowed to be passed in the BigNumber.constructor');
        if (!equals_undefined(float)) {
            const integerPart = Math.trunc(Number(float));
            this.Float = Number(float) - integerPart;
            this.int += this._toBigInt(integerPart) + this._toBigInt(any);
        }
        else
            switch (typeof any) {
                case 'string':
                    //let $int: string = ''; let $float: string = '';
                    const matches = any.match(/^([+\-]?)(\d+)(?:n?\.(\d+))?n?$/);
                    if (matches) {
                        try {
                            this.int = BigInt(matches[2]);
                        }
                        catch (Error) {
                            this.int = BigInt(0);
                        }
                        if (matches[3] === undefined) {
                            this.Float = Number('0.0');
                        }
                        else {
                            this.Float = Number(`0.${matches[3]}`);
                        }
                        if (matches[1] === '+' || matches[1] === '-') {
                            dont_change_the_sign = true;
                            this.sign = matches[1];
                        }
                        else if (matches[1] === '') {
                            dont_change_the_sign = true;
                            this.sign = '+';
                        }
                    }
                    else {
                        this.Float = NaN;
                    }
                    break;
                case 'bigint':
                    this.int = BigInt($any);
                    this.Float = Number(0);
                    break;
                case 'boolean':
                case 'number':
                    this.int = BigInt(0);
                    this.Float = Number($any);
                    break;
                case 'undefined':
                    this.int = BigInt(0);
                    this.Float = 0;
                    break;
                default:
                    if ($any instanceof BigNumber) {
                        const [i, f] = $any.valueOf_this();
                        this.Float = Number(f);
                        this.int = BigInt(i);
                        break;
                    }
                    else {
                        const int = Number(this.int = this._toBigInt($any));
                        this.Float = Number($any) - int;
                    }
            }
        const integerPart = Math.trunc(this.Float);
        this.Float = this.Float - integerPart;
        this.int += this._toBigInt(integerPart);
        if (!dont_change_the_sign)
            switch (Math.sign(Number(this.int))) {
                case +1:
                case +0:
                    this.sign = '+';
                    break;
                case -1:
                case -0:
                    this.sign = '-';
                    break;
            }
        if (this.int < 0)
            this.int = -this.int;
        if (this.Float < 0)
            this.Float = -this.Float;
    }
    _toBigInt(n) {
        try {
            return BigInt(n);
        }
        catch (_) {
            return 0n;
        }
    }
    toString(withN = false) {
        if (this.Float !== this.Float)
            return 'NaN';
        let result = String(this.int) + (withN ? 'n' : '');
        if (this.Float !== 0) {
            result += `.${this.Float.toString().split('.')[1]}`;
        }
        return `${this.sign}${result}`;
    }
    plus(mixed) {
        if (mixed !== mixed) {
            throw new Error('we cannot add to NaN');
        }
        else if (mixed instanceof BigNumber) {
            return new BigNumber(this.getINT() + mixed.getINT(), this.getFloat() + mixed.getFloat());
        }
        else if (typeof mixed === 'bigint') {
            return new BigNumber(this.getINT() + mixed, this.getFloat());
        }
        else if (typeof mixed === 'number') {
            return new BigNumber(this.getINT(), this.getFloat() + mixed);
        }
        else {
            throw new TypeError("'mixed' is not of type BigInt, Number, or BigNumber");
        }
    }
    negate() {
        return new BigNumber(-this.getINT(), this.getFloat());
    }
    valueOf() {
        return +this.toString();
    }
    valueOf_this() {
        return [this.int, this.Float];
    }
    getFloat() {
        return Number(`${this.sign}${this.Float}`);
    }
    getINT() {
        return BigInt(`${this.sign}${this.int}`);
    }
    // Math.
    Math_floor() {
        switch (this.sign) {
            case "+":
                return this.getINT();
            case "-":
                if (this.getFloat() !== 0) {
                    return -this.getINT() + 1n;
                }
                else {
                    return -this.getINT();
                }
        }
    }
    Math_ceil() {
        switch (this.sign) {
            case "-":
                return -this.getINT();
            case "+":
                if (this.getFloat() !== 0) {
                    return this.getINT() + 1n;
                }
                else {
                    return this.getINT();
                }
        }
    }
    Math_round() {
        return BigInt((new BigNumber(this.getINT(), Math.round(this.getFloat()))).getINT());
        //BigInt(`${this.sign}${bigint}`);
    }
    Math_trunc() {
        return this.getINT();
    }
    toJSON() {
        return this.toString(true);
    }
}
function isSafeBigInteger(n, Strict = false) {
    if (n === null)
        return false;
    if ((typeof n) === 'string') {
        n = String(n).replace(/n$/, '');
    }
    if (Strict) {
        n = BigInt(n);
    }
    return (n <= BigInt(Number.MAX_SAFE_INTEGER) && n >= BigInt(Number.MIN_SAFE_INTEGER));
}
function isSafeBigIntOnly(n) {
    if ((typeof n) === 'bigint' || (typeof n) === 'number') {
        return (n <= BigInt(Number.MAX_SAFE_INTEGER) && n >= BigInt(Number.MIN_SAFE_INTEGER));
    }
    return false;
}
