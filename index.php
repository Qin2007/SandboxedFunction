<?php require_once "{$_SERVER['DOCUMENT_ROOT']}/home/header/create_head.php";

use ANT_COOKIE_Consent\ANTNavOption;
use function ANT_COOKIE_Consent\ANTNavHome;
use function ANT_COOKIE_Consent\create_head;

create_head('Browser ECMAScript Environment', [
    'base' => '/browser/', 'maxWidth' => '600px',
], [
], [
    ANTNavHome(),
    new ANTNavOption('/browser/', '/dollmaker1/endpoint.php?preset=Bee',
        'javascript ANT', '#a68300', '#fff100', true),
    new ANTNavOption('php.php', '/dollmaker1/endpoint.php?preset=Magnata',
        'PHP ANT (WIP)', '#a68300', '#fff100'),
]) ?>
<div class="divs nav-home">
    <div>
        <h1>Browser ECMAScript Environment</h1>
        <p hidden>this is my openSource SandboxedFunction Project. it should be a dynamic safe way to execute arbitrary
            code
            like user inputs. it will eventually be available for javascript, php and maybe python. baseline executables
            for javascript are ow finished. read the change log for more details
        <p>This text describes an open-source project that allows users to safely execute arbitrary code. The project is
            still under development, but the basic version for JavaScript is complete. For more information, please see
            the change log.
    </div>
    <label for="Sandboxed-indexed">Test out SandboxedFunction</label>
    <br/>
    <textarea id="Sandboxed-indexed" rows="25" style="width:100%;"
    ><?= ANT_COOKIE_Consent\htmlspecialchars12(<<<JS
        function hypertext() {
            return "hello";
        }
        return hypertext()
        JS. ";");
        $update_log = [
            ['baseline functionallity, like console.log and function calls, ' .
                'setting variables and function arguments might not work yet.' .
                ' but math expressions do!', new Date('2025-01-13T15:41:11.000Z')],
        ] ?></textarea><br/>
    <button onclick="sandboxedfunction()" type=button>run</button>
    <p>please note that the SandboxedFunctions are still work in progress,
    <p><a href="https://github.com/Qin2007/SandboxedFunction">our github</a>
        <script src="javascript.js"></script>
        <script src="deepproxy.js"></script>
        <script src="utils.js"></script>
        <script src="BigNumber.js"
        ></script>
        <script src="toJSON.js"
        ></script>
    <pre><output aria-label="Result of the code execution"></output></pre>
    <h2>Update Log (Most Recent Patch FIRST)</h2>
    <ol><?= ($n = "\n    ");
        foreach ($update_log as $item) {
            $h = $item[1]->toHTML('[tojavascript]');
            echo "<li>$item[0] ($h)$n";
        } ?></ol>
</div>
<script src="bytes.js"
></script>
<script>
    function getFrom(property, array, separator = '') {
        const result = [];
        for (const arrayElement of array) {
            result.push(arrayElement[property]);
        }
        return result.join(separator)
    }

    const indexed = document.getElementById('Sandboxed-indexed');
    const buffer = document.querySelector('pre>output');

    buffer.innerText = '<output';
    buffer.innerText += ' here>';

    function sandboxedfunction() {
        const hello = new SandboxedFunction(indexed.value);
        try {
            buffer.innerText += '\n\n' + JSON.stringify(hello.addBufferListener(function (v1) {
                buffer.innerText += v1 + '\n\n';
            }).run(), function (key, value) {
                switch (typeOf(value, typeOf.functionsAreObjects)) {
                    case "undefined":
                        return "undefined";
                    case "function":
                        return value.toString();
                }
                return value;
            }, 2);
        } catch (e) {
            buffer.innerText += '\n\n' + e.toString();
        }
    }

    /*(function () {const hello = new SandboxedFunction(code);document.querySelector('pre').innerText += JSON.stringify({
    runner: hello.run().value, hello,}, function (key, value) {switch (typeOf(value, typeOf.NAN_IS_NAN)) {
    case"undefined":return "Symbol(__.undefined)";case"NaN":return "NaN";case"function":return value.toString();
    }return value;}, 4);})();*/
</script>
