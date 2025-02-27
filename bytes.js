// custom bytes
function Bytes(any) {
    // const typeof_any = any === null ? 'NULL' : (typeof any);
    const array = [];
    if (Array.isArray(any)) {
        any.map(Bytes).forEach(function (e) {
            array.push(...String(e).split(/,/g));
        });
        array.forEach(function (value, index, array) {
            array[index] = Number(value);
        });
        array.forEach(function (number) {
            if (!Number.isSafeInteger(number) || number < 0) {
                throw new Error(`only positive Safe Integers allowed. (${number}) is not a positive safe integer`);
            }
        });
    } else if ((typeof any) === 'number') {
        array.push(any);
    } else {
        array.push(...[...String(any)].map(function (self) {
            return self.charCodeAt(0);
        }));
    }
    const result = Bytes.to8BitArray(array);
    if (!new.target) {
        return result;
    }
    this.array = result;
}

Bytes.prototype.btoa = function () {
    const self = this;
    let binary = this.array.map(function (number) {
        return Bytes.toBinaryString(number).padStart(8, '0');
    });
    binary = this.constructor.chunkString(binary.join(''), 6);
    binary = binary.map(function (string) {
        return string.join('').padEnd(6, '0');
    }).join().replace(/,0{6}$/, '').split(/,/g);
    binary = binary.map(function (sandboxedInteger) {
        return self.constructor.b64Table[parseInt(sandboxedInteger, 2)];
    });
    return Bytes.padEvenly(binary.join(''), 4, '=');
};
Bytes.btoa = function (string) {
    return (new Bytes(String(string))).btoa();
};
Bytes.atob = function (base64) {
    base64 = String(base64);
    if (base64.length % 4 !== 0) {
        throw new Error(`Invalid length of base64 (${base64.length});`);
    }
    base64 = base64.replace(/=+$/, '');
    const decodedBytes = [];
    for (let i = 0; i < base64.length; i++) {
        decodedBytes.push(Bytes.a64Table[base64[i]]);
    }
    let binaryString = decodedBytes.map(function (value) {
        return Number(value).toString(2).padStart(6, '0');
    }).join('');
    const outputBytes = [];
    while (binaryString.length >= 8) {
        outputBytes.push(parseInt(binaryString.slice(0, 8), 2));
        binaryString = binaryString.slice(8);
    }
    return new Bytes(outputBytes);
};
Bytes.prototype.toCodepointString = function () {
    return String.fromCharCode(...this.array);
};
Bytes.prototype.hexDump = function () {
    return this.array.map(function (element) {
        return Number(element).toString(16);
    }).join();
};
Bytes.toBinaryString = function (number) {
    if (isNaN(number)) {
        throw new Error('number is NaN');
    }
    number = Math.abs(Number(number));
    const binary = [];
    while (number > 0) {
        binary.push(number % 2);
        number = Math.floor(number / 2);
    }
    return binary.reverse().join().replace(/\D/g, '');
}
Bytes.chunkString = function (string, number) {
    string = String(string);
    number = Number(number);
    const array = [[]];
    Bytes.assert(number === number, 'number is NaN');
    let index = 0, indexedArray = 0;
    for (const string1 of Array.from(string)) {
        array[indexedArray].push(string1);
        if (++index % number === 0) {
            array[++indexedArray] = [];
        }
    }
    return array;
};
Bytes.chunk = function (item, number) {
    number = Number(number);
    const array = [[]];
    Bytes.assert(number === number, 'number is NaN');
    let index = 0, indexedArray = 0;
    for (const string1 of item) {
        array[indexedArray].push(string1);
        if (++index % number === 0) {
            array[++indexedArray] = [];
        }
    }
    return array;
};
Bytes.to8BitArray = function (numbers) {
    const result = [];
    for (let num of numbers) {
        num = Number(num);
        const bytes = [];
        while (num > 0) {
            bytes.push(num & 0xFF);
            num = num >> 8;
        }
        result.push(...bytes.reverse());
    }
    return result;
};
Bytes.assert = function (boolean, error) {
    if (!boolean) {
        throw new Error(error);
    }
};
Bytes.isPrimitive = function (o) {
    if (o === null) return true;
    switch (typeof o) {
        case "object":
        case "function":
            return false;
        default:
            return true;
    }
};
Bytes.toPrimitive = function (O) {
    if (Bytes.isPrimitive(O)) return O;
    let x = Object(O);
    let n = 0;
    while (!Bytes.isPrimitive(x)) {
        const o = Object(x);
        if (Symbol.toPrimitive in o) {
            const result = o[Symbol.toPrimitive]('default');
            if (Bytes.isPrimitive(result)) x = result;
        }
        if ('valueOf' in o) {
            const result = o.valueOf();
            if (Bytes.isPrimitive(result)) x = result;
        }
        if ('toString' in o) {
            const result = o.toString();
            if (Bytes.isPrimitive(result)) x = result;
        }
        if ((++n) > 800) throw new Error('precaution recursion');
    }
    return x;
};
Bytes.B64Table = function () {
    const B64Table = {};
    for (let x = 0; x < 64; x++) {
        if (x < 26) {
            B64Table[x] = String.fromCharCode(x + 65);
        } else if (x < 52) {
            B64Table[x] = String.fromCharCode((x - 26) + 97);
        } else if (x < 62) {
            B64Table[x] = String.fromCharCode((x - 52) + 48);
        } else if (x === 62) {
            B64Table[x] = '+';
        } else if (x === 63) {
            B64Table[x] = '/';
        }
    }
    return B64Table;
};
Bytes.a64Table = (function (object) {
    const a64Table = {};
    for (const [x, entry] of Object.entries(object)) {
        a64Table[entry] = x;
    }
    return a64Table;
})(Bytes.b64Table = Bytes.B64Table());
Bytes.padEvenly = function (string, multipleOf, padWith = '=') {
    string = String(string);
    multipleOf = Number(multipleOf);

    if (Number.isNaN(multipleOf) || multipleOf <= 0) {
        throw new Error("multipleOf must be a positive number");
    }

    let remainder = string.length % multipleOf;
    let padLength = remainder === 0 ? 0 : multipleOf - remainder;

    return string + String(padWith).repeat(padLength);
};
