// SymbolRegistry
export class SymbolRegistry {
    symbols;
    constructor() {
        this.symbols = {};
    }
    register(name) {
        if (name === undefined)
            throw new Error('undefined as value is explicitly disallowed');
        name = String(name);
        return this.symbols[name] = (this.symbols[name] ?? Symbol(name));
    }
    has(name) {
        return Boolean(this.symbols[String(name)]);
    }
    deleteSymbol(name) {
        if (name === undefined)
            throw new Error('undefined as value is explicitly disallowed');
        name = String(name);
        if (this.has(name)) {
            delete this.symbols[name];
            return true;
        }
        else {
            return false;
        }
    }
}
