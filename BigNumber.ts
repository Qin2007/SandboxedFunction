// BigInt?
function equals_undefined($any: any): boolean {
    return $any === undefined || $any === null;
}

class BigNumber {
    private readonly int: bigint = 0n;
    private readonly Float: number = 0;
    private readonly sign: '+' | '-' = '+';

    constructor(any?: any, float?: number) {
        const $any = any;
        let dont_change_the_sign = Boolean();
        if ((typeof any) === 'symbol')
            throw new Error('Symbol() has been explicitly disallowed to be passed in the BigNumber.constructor');
        if (!equals_undefined(float)) {
            const integerPart: number = Math.trunc(Number(float));
            this.Float = Number(float) - integerPart;
            this.int += this._toBigInt(integerPart) + this._toBigInt(any);
        } else
            switch (typeof any) {
                case'string':
                    //let $int: string = ''; let $float: string = '';
                    const matches = any.match(/^([+\-]?)(\d+)(?:n?\.(\d+))?n?$/);
                    if (matches) {
                        try {
                            this.int = BigInt(matches[2]);
                        } catch (Error) {
                            this.int = BigInt(0);
                        }
                        if (matches[3] === undefined) {
                            this.Float = Number('0.0');
                        } else {
                            this.Float = Number(`0.${matches[3]}`);
                        }
                        if (matches[1] === '+' || matches[1] === '-') {
                            dont_change_the_sign = true;
                            this.sign = matches[1];
                        } else if (matches[1] === '') {
                            dont_change_the_sign = true;
                            this.sign = '+';
                        }
                    } else {
                        this.Float = NaN;
                    }
                    break;
                case'bigint':
                    this.int = BigInt($any);
                    this.Float = Number(0);
                    break;
                case'boolean':
                case'number':
                    this.int = BigInt(0);
                    this.Float = Number($any);
                    break;
                case'undefined':
                    this.int = BigInt(0);
                    this.Float = 0;
                    break;
                default:
                    if ($any instanceof BigNumber) {
                        const [i, f] = $any.valueOf_this();
                        this.Float = Number(f);
                        this.int = BigInt(i);
                        break;
                    } else {
                        const int: number = Number(this.int = this._toBigInt($any));
                        this.Float = Number($any) - int;
                    }
            }
        const integerPart: number = Math.trunc(this.Float);
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
        if (this.int < 0) this.int = -this.int;
        if (this.Float < 0) this.Float = -this.Float;
    }

    private _toBigInt(n?: any): bigint {
        try {
            return BigInt(n);
        } catch (_) {
            return 0n;
        }
    }

    public toString(withN: boolean = false): string {
        if (this.Float !== this.Float) return 'NaN';
        let result = String(this.int) + (withN ? 'n' : '');
        if (this.Float !== 0) {
            result += `.${this.Float.toString().split('.')[1]}`;
        }
        return `${this.sign}${result}`;
    }

    public plus(mixed?: BigNumber | number | bigint): BigNumber {
        if (mixed !== mixed) {
            throw new Error('we cannot add to NaN');
        } else if (mixed instanceof BigNumber) {
            return new BigNumber(this.getINT() + mixed.getINT(), this.getFloat() + mixed.getFloat());
        } else if (typeof mixed === 'bigint') {
            return new BigNumber(this.getINT() + mixed, this.getFloat());
        } else if (typeof mixed === 'number') {
            return new BigNumber(this.getINT(), this.getFloat() + mixed);
        } else {
            throw new TypeError("'mixed' is not of type BigInt, Number, or BigNumber");
        }
    }

    public negate(): BigNumber {
        return new BigNumber(-this.getINT(), this.getFloat());
    }

    public valueOf() {
        return +this.toString();
    }

    public valueOf_this() {
        return [this.int, this.Float];
    }

    public getFloat(): number {
        return Number(`${this.sign}${this.Float}`);
    }

    public getINT(): bigint {
        return BigInt(`${this.sign}${this.int}`);
    }

    // Math.
    public Math_floor(): BigInt {
        switch (this.sign) {
            case "+":
                return this.getINT();
            case "-":
                if (this.getFloat() !== 0) {
                    return -this.getINT() + 1n;
                } else {
                    return -this.getINT()
                }
        }
    }

    public Math_ceil(): BigInt {
        switch (this.sign) {
            case "-":
                return -this.getINT();
            case "+":
                if (this.getFloat() !== 0) {
                    return this.getINT() + 1n;
                } else {
                    return this.getINT()
                }
        }
    }

    public Math_round(): BigInt {
        return BigInt((new BigNumber(this.getINT(), Math.round(this.getFloat()))).getINT());
        //BigInt(`${this.sign}${bigint}`);
    }

    public Math_trunc(): BigInt {
        return this.getINT();
    }

    public toJSON() {
        return this.toString(true);
    }
}

function isSafeBigInteger(n: bigint | any, Strict: boolean = false): boolean {
    if (n === null) return false;
    if ((typeof n) === 'string') {
        n = String(n).replace(/n$/, '');
    }
    if (Strict) {
        n = BigInt(n);
    }
    return (n <= BigInt(Number.MAX_SAFE_INTEGER) && n >= BigInt(Number.MIN_SAFE_INTEGER));
}

function isSafeBigIntOnly(n: bigint | any): boolean {
    if ((typeof n) === 'bigint' || (typeof n) === 'number') {
        return (n <= BigInt(Number.MAX_SAFE_INTEGER) && n >= BigInt(Number.MIN_SAFE_INTEGER));
    }
    return false;
}
