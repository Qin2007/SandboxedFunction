<?php require_once "{$_SERVER['DOCUMENT_ROOT']}/home/header/create_head.php";

use ANT_COOKIE_Consent\ANTNavOption;
use function ANT_COOKIE_Consent\ANTNavHome;
use function ANT_COOKIE_Consent\create_head;

create_head('Browser PHP Environment', ['base' => '/browser/'], [
], [
        ANTNavHome(),
        new ANTNavOption('/browser/', '/dollmaker1/endpoint.php?preset=Bee',
            'javascript ANT', '#a68300', '#fff100'),
        new ANTNavOption('php.php', '/dollmaker1/endpoint.php?preset=Magnata',
            'PHP ANT (WIP)', '#6a35a6', '#8e46db', true)]
); ?>
<div class="divs nav-home">
    <h1>Browser PHP Environment</h1>
    <p>open the console to test it out</p>
    <p>please note that the SandboxedFunctions are still work in progress,
    <p><a href="https://github.com/Qin2007/SandboxedFunction">our github</a></p>
    <script src="deepproxy.js"></script>
    <script src="utils.js"></script>
    <script src="php.js"></script>
    <pre></pre>
</div>
<script>
    (function () {
        function htmldecode(String_) {
            return String(String_).replace(/&(?:#38|amp);/g, '&').replace(/&(?:#39|apos);/g, '\'').replace(/&(?:#34|quot);/g, '\"').replace(/&(?:#60|lt);/g, '<').replace(/&(?:#62|gt);/g, '>');
        }
        const code = htmldecode(`Hello&lt;?= (5 + 5) * 7 + 8;?&gt;`);
        const hello = new SandboxedFunctionPHP(code);
        const result = hello.run();
        console.log(result);
        document.querySelector('pre').innerText += result + '\n\n';
        document.querySelector('pre').innerText += JSON.stringify(hello, null, 2);
    })();
</script>
