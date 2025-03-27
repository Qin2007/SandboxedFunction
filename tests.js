import {PrototypeMap, SandboxedFunction, typeOf} from "./SandboxedFunction.js";
import fs from 'node:fs';
import {Datetime_global} from "datetime_global/Datetime_global.js";
import * as chrono from "chrono-node";
/*`"use strict";
"\\\\\\\\";window.document.addEventListener('DOMContentLoaded', function () {
    // commented
    document.querySelectorAll('time.toLocalTime').forEach(function (each) {
        each.innerText = \`Left-\${new Date(each.dateTime)}-Right\`.replace(/ GMT.+/, '');
    });
    document.querySelectorAll('time.toSelfTime').forEach(function (each) {
        each.innerText = (new Date(each.dateTime)).toString();
    });
    document.querySelectorAll('time[data-toLocalTime]').forEach(function (each) {
    const innerText = (formatDate(new Date(each.dateTime), each.getAttribute('data-toLocalTime')));
        each.innerText = innerText.replace(/\\s*\\(?UTC\\)?/ig, '');
    });
});`*/
/**/
//SandboxedFunction.__tokenize
//chrono.parseDate
const sandboxedFunction = new SandboxedFunction(`function hypertext() {
    return 5 + 5 * 6;//"hello";
}
return hypertext();`), sandboxedFunction_string = sandboxedFunction.toHTMLString();
//<pre class=${SandboxedFunction.SandboxedFunctionHTMLClass}outerHTML role=none><code>${JSON.stringify(sandboxedFunction, null,2)}</code></pre>
fs.writeFile('hyperNode.html', `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<!--${sandboxedFunction_string.length}--><title>SandBoxedFunction</title>${SandboxedFunction.style}</head>
<body>${sandboxedFunction_string}<pre class=${SandboxedFunction.SandboxedFunctionHTMLClass}outerHTML role=none><code>${JSON.stringify(sandboxedFunction, null,2)}</code></pre></body></html>`, err => {
    if (err) {
        console.error(err);
    } else {
        // file written successfully
        const x = JSON.stringify(sandboxedFunction.run(), null, 2);
        fs.writeFile('hyper.json', String(x), err => {
            if (err) {
                console.error(err);
            } else {
                // file written successfully
            }
        });
    }
});
