// typeOf-types.ts
function typeOf(mixed: any): "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "NULL" {
    if (mixed === null) return 'NULL';
    return typeof mixed;
}
