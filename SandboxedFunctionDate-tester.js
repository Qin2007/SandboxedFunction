import {SandboxedFunctionDate} from "./SandboxedFunctionDate.js";

const benchmark = new SandboxedFunctionDate('return F2024-05-06T01:02:03.004005+06:00[Europe/Amsterdam].toInstant() + 5;');
console.log(benchmark);
console.log('output:', JSON.stringify(benchmark.run(), function (_, value) {
    switch (typeof value) {
        case "undefined":
            return "Symbol(#undefined)";
        case "symbol":
            return String(value);
        case "bigint":
            return `${value}n`;
        case "function":
            return `${value}`;
        default:
            return value;
    }
}, 2));
