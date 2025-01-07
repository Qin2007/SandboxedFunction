# SandboxedFunction

SandboxedFunction is a javascript library to execute javascript safely in the browser.

SandboxedFunctionPHP is the same thing except it executes php in the browser

## how to set up

get a webserver to serve the files. then use them like this

```javascript
const sandboxedFunction = new SandboxedFunction(`your code here`, /*you can here insert an object that should act as the global, note that the user cannot modify it (its proxyed)*/);

const returnValue = sandboxedFunction.run();
```

## why?

because i need to execute it in the browser

## some files seem to be unnecessary.

some are! some arent. please do not remove them