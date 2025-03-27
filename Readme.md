# SandboxedFunction: A Browser ECMAScript Environment

the SandboxedFunction class in this SandboxedFunction package is to write SandboxedFunctions without using `eval`
or `Function`, its pure javascript.

## earlyDev

this package is early in development, its not stable.

## documentation

to get started construct the `SandboxedFunction`

```typescript
const sandboxedFunction = new SandboxedFunctions(`/*code here*/`);
```

you can construct without new but i still have to consider what to do if you do (currently it give insertable html).
