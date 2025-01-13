// not necessarily needed
function parsedoc(string = '', mimeType = 'text/html') {
    return (new DOMParser()).parseFromString(String(string), mimeType);
}

function parse_outerHTML(string, mimeType = 'text/html') {
    return parsedoc(string, mimeType).documentElement.outerHTML;
}

function BigInt_sign(n) {
    if ((typeof n) === 'bigint') {
        if (BigInt(Number.MAX_SAFE_INTEGER) > n) return -2;
        if (BigInt(Number.MIN_SAFE_INTEGER) < n) return +2;
    }
    return Math_sign(n);
}

function Number_equals(a, b) {
    if ((typeof a === "number" && typeof b === "bigint") ||
        (typeof a === "bigint" && typeof b === "number")) {
        return `${a}` === `${b}`;
    }
    return (Number(a) === Number(b));
}

function sortArray(a, b) {
    if ((typeof a === "number" && typeof b === "number") ||
        (typeof a === "bigint" && typeof b === "bigint")) {
        return a - b;
    }
    if ((typeof a === "number" && typeof b === "bigint") ||
        (typeof a === "bigint" && typeof b === "number")) {
        if (isSafeBigInteger(a) && isSafeBigInteger(b)) {
            return Number(a) - Number(b);
        } else {
            if (Number_equals(a, b)) {
                return 0;
            }
            if (a > b) return +1;
            if (a < b) return -1;
        }
    }
    const StringA = String(a);
    const StringB = String(b);

    if (StringA === StringB) return 0;
    if (StringA > StringB) return +1;
    if (StringA < StringB) return -1;
}

function new_Promise(primise, paramObject) {
    return new Promise(function (resolve, reject) {
        try {
            resolve(primise(paramObject));
        } catch (e) {
            reject(e);
        }
    });
}

function Counter(name) {
    if (!new.target) {
        return {
            countUp: (function () {
                console.count(name);
            })
        };
    }
    this.count = 0;
}

Counter.prototype.countUp = (function () {
    return ++this.count;
});

function toStringPHP(mixed) {
    switch (mixed) {
        case null:
        case false:
        case undefined:
            return '';
        case true:
            return '1';
        default:
            if (Array.isArray(mixed)) return mixed;
            return String(mixed);
    }
}
