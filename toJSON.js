// toJSON.stringify
RegExp.prototype.toJSON = function () {
    return this.toString();
};
Date.prototype.toJSON = function () {
    return {
        year: this.getFullYear(),
        monthIndex: this.getMonth(),
        date: this.getDate(),
        day: this.getDay(),
        H: this.getHours(),
        i: this.getMinutes(),
        s: this.getSeconds(),
        ms: this.getMilliseconds(),
        tz: this.getTimezoneOffset(),
        utc: this.toISOString(),
        this: this.toString(),
    };
};

BigInt.prototype.toJSON = function () {
    return `${this}n`;
};
const date = new Date();
const http = JSON.stringify([5n,date], null, 2);
//pre.innerText = http;console.log(JSON.parse(http));

function processArray(arr) {
    const array2 = [];

    for (const value of arr) {
        try {
            // Try converting the value to BigInt
            const bigIntValue = BigInt(value);
            array2.push(bigIntValue);
        } catch {
            // If BigInt conversion fails, try converting to Number
            const numberValue = Number(value);
            if (!Number.isNaN(numberValue)) {
                array2.push(numberValue);
            }
        }
    }

    return array2;
}

function customMax(arr) {
    const validValues = processArray(arr);
    if (validValues.length === 0) return NaN;
    return validValues.reduce((max, val) => (val > max ? val : max));
}

function customMin(arr) {
    const validValues = processArray(arr);
    if (validValues.length === 0) return NaN;
    return validValues.reduce((min, val) => (val < min ? val : min));
}
