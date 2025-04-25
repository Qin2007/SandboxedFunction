// SymbolRegistry
export class SymbolRegistry {
    private readonly symbols: Record<string, symbol>;

    constructor() {
        this.symbols = {};
    }

    register(name: string): symbol {
        if (name === undefined) throw new Error('undefined as value is explicitly disallowed');
        name = String(name);
        return this.symbols[name] = (this.symbols[name] ?? Symbol(name));
    }

    has(name: string): boolean {
        return Boolean(this.symbols[String(name)]);
    }

    deleteSymbol(name: string): boolean {
        if (name === undefined) throw new Error('undefined as value is explicitly disallowed');
        name = String(name);
        if (this.has(name)) {
            delete this.symbols[name];
            return true;
        } else {
            return false;
        }
    }
}