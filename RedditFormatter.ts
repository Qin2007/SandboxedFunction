// RedditFormatter.ts
class RedditFormatter {
    private array: string[];

    constructor(string: string) {
        this.array = [RedditFormatter.normalize_newlines(string)];
    }

    static escape(string: string): string {
        return RedditFormatter.normalize_newlines(string).replace(/[~`>\-\\\[\]()#^&*_]/g, '\\$&');
    }

    static normalize_newlines(string: string): string {
        return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    toString(): string {
        return this.array.join('');
    }

    addText(string: string) {
        this.array.push(RedditFormatter.escape(string));
    }

    addRaw(string: string) {
        this.array.push(RedditFormatter.normalize_newlines(string));
    }
    addBold(string: string) {
        this.array.push(`**${RedditFormatter.escape(string)}**`);
    }
    addItalics(string: string) {
        this.array.push(`*${RedditFormatter.escape(string)}*`);
    }
    addBoldItalics(string: string) {
        this.array.push(`***${RedditFormatter.escape(string)}***`);
    }
}