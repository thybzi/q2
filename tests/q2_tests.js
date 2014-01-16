;(function() {
    'use strict';

    var basicQueryContent = 'first=10&second=6.5&last=someValue';

    var urls = {
        basic:          'http://example.com/?' + basicQueryContent,
        withFragment:   'http://example.com/?' + basicQueryContent + '#anchor=1&notparam=2',
        queryOnly:      '?' + basicQueryContent,
        contentOnly:    basicQueryContent,
        mixedCase:      'lowercase=aBc12&camelCase=dEf34',
        emptyVals:      'first=10&&empty=&noVal&last=someValue',
        zeroVals:       'zero=0&zeroFloat=0.0&one=1',
        boolVals:       'trueVal=true&trueUpVal=True&falseVal=false',
        undefStrParam:  'first=10&undefinedStr=undefined&last',
        jsObjInherited: 'constructor=10&prototype=6.5&hasOwnProperty=someValue',
        urlEncoded:     'spacedVal=has%20space&spaced%20param=10&%D1%8F%D0%B7%D1%8B%D0%BA=%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9',
        semicolon:      'first=10;second=6.5;last=someValue',
        entity:         'first=10&amp;second=6.5&amp;last=someValue',
        custom:         'first:10|second:6.5|last:someValue',
        emptyStr:       '',
        bogus:          'not-an-url',
        nullStr:        'null',
        nullVal:        null,
        undefinedStr:   'undefined',
        undefinedVal:   undefined
    };

    QUnit.testStart(function() {
        _q2.resetOptions();
        _q2.purgeCache();
    });


    module('getQueryParam method');

    test('Basic tests', function() {

        // Getting params
        strictEqual(
            _q2.getQueryParam('first', urls.basic),
            '10',
            'value get: first param'
        );
        strictEqual(
            _q2.getQueryParam('second', urls.basic),
            '6.5',
            'value get: second param'
        );
        strictEqual(
            _q2.getQueryParam('last', urls.basic),
            'someValue',
            'value get: last param'
        );
        strictEqual(
            _q2.getQueryParam('nonexistent', urls.basic),
            undefined,
            'value get: nonexistent param'
        );

    });

    test('Empty values', function() {

        strictEqual(
            _q2.getQueryParam('empty', urls.emptyVals),
            '',
            'value get: empty param'
        );
        strictEqual(
            _q2.getQueryParam('noVal', urls.emptyVals),
            '',
            'value get: noVal param'
        );
        strictEqual(
            _q2.getQueryParam('', urls.emptyVals),
            undefined,
            'value get: empty param name'
        );

    });

    test('Bool values tests', function() {

        strictEqual(
            _q2.getQueryParam('trueVal', urls.boolVals),
            true,
            'value get: trueVal param'
        );
        strictEqual(
            _q2.getQueryParam('falseVal', urls.boolVals),
            false,
            'value get: falseVal param'
        );

        strictEqual(
            _q2.getQueryParam('trueUpVal', urls.boolVals),
            'True',
            'value get: trueUpVal param'
        );

        strictEqual(
            _q2.getQueryParam('trueUpVal', urls.boolVals, { specialValueCaseIgnore: true }),
            true,
            'value get: trueUpVal param (case-ignore for specials ENABLED)'
        );

        strictEqual(
            _q2.getQueryParam('trueVal', urls.boolVals, { parseConvertBool: false }),
            'true',
            'value get: trueVal param (bool convert DISABLED)'
        );
        strictEqual(
            _q2.getQueryParam('falseVal', urls.boolVals, { parseConvertBool: false }),
            'false',
            'value get: falseVal param (bool convert DISABLED)'
        );

    });

    test('Zero values tests', function() {

        strictEqual(
            _q2.getQueryParam('zero', urls.zeroVals),
            0,
            'value get: zero param'
        );
        strictEqual(
            _q2.getQueryParam('zeroFloat', urls.zeroVals),
            '0.0',
            'value get: zeroFloat param'
        );
        strictEqual(
            _q2.getQueryParam('one', urls.zeroVals),
            '1',
            'value get: one param'
        );
        strictEqual(
            _q2.getQueryParam('zero', urls.zeroVals, { parseConvertZero: false }),
            '0',
            'value get: zero param (zero convert DISABLED)'
        );

    });

    test('Param case tests', function() {

        strictEqual(
            _q2.getQueryParam('lowercase', urls.mixedCase),
            'aBc12',
            'value get: lowercase => lowercase'
        );
        strictEqual(
            _q2.getQueryParam('camelCase', urls.mixedCase),
            'dEf34',
            'value get: camelCase => camelCase'
        );
        strictEqual(
            _q2.getQueryParam('camelcase', urls.mixedCase),
            'dEf34',
            'value get: camelCase => camelcase'
        );
        strictEqual(
            _q2.getQueryParam('CamELcaSe', urls.mixedCase),
            'dEf34',
            'value get: camelCase => CamELcaSe'
        );
        strictEqual(
            _q2.getQueryParam('camelCase', urls.mixedCase, { paramNameCaseIgnore: false }),
            'dEf34',
            'value get: camelCase => camelCase (case ignore DISABLED)'
        );
        strictEqual(
            _q2.getQueryParam('camelcase', urls.mixedCase, { paramNameCaseIgnore: false }),
            undefined,
            'value get: camelCase => camelcase (case ignore DISABLED)'
        );

    });

    test('JS internal props synonym params', function() {

        strictEqual(
            _q2.getQueryParam('constructor', urls.jsObjInherited),
            '10',
            'value get: constructor'
        );
        strictEqual(
            _q2.getQueryParam('prototype', urls.jsObjInherited),
            '6.5',
            'value get: prototype'
        );
        strictEqual(
            _q2.getQueryParam('hasOwnProperty', urls.jsObjInherited),
            'someValue',
            'value get: hasOwnProperty'
        );
        strictEqual(
            _q2.getQueryParam('hasOwnProperty', urls.jsObjInherited, { paramNameCaseIgnore: false }),
            'someValue',
            'value get: hasOwnProperty (case ignore DISABLED)'
        );
        strictEqual(
            _q2.getQueryParam('hasOwnProperty', urls.basic, { paramNameCaseIgnore: false }),
            undefined,
            'value get: hasOwnProperty (case ignore DISABLED, param undefined)'
        );

    });


    test('URL-encoded values/params tests', function() {

        strictEqual(
            _q2.getQueryParam('spacedVal', urls.urlEncoded),
            'has space',
            'value having space'
        );
        strictEqual(
            _q2.getQueryParam('spaced param', urls.urlEncoded),
            '10',
            'param name having space'
        );
        strictEqual(
            _q2.getQueryParam('язык', urls.urlEncoded),
            'русский',
            'cyrillic param name and value'
        );
        strictEqual(
            _q2.getQueryParam('язык', urls.urlEncoded, { urlEncodeAndDecode: false }),
            undefined,
            'cyrillic param name and value (url-decode DISABLED)'
        );

    });


    test('Alternate params', function() {

        strictEqual(
            _q2.getQueryParam([ 'first', 'last' ], urls.basic),
            '10',
            'first of values get: [first, last]'
        );
        strictEqual(
            _q2.getQueryParam([ 'last', 'first' ], urls.basic),
            'someValue',
            'first of values get: [last, first]'
        );
        strictEqual(
            _q2.getQueryParam([ 'nonexistent', 'last', 'first' ], urls.basic),
            'someValue',
            'first of values get: [nonexistent, last, first]'
        );
        strictEqual(
            _q2.getQueryParam([ 'undefinedStr', 'last', 'first' ], urls.undefStrParam),
            null,
            'first of values get: [undefinedStr, last, first]'
        );
        strictEqual(
            _q2.getQueryParam([ 'undefinedStr', 'last', 'first' ], urls.undefStrParam, { parseConvertUndefined: false }),
            'undefined',
            'first of values get: [undefinedStr, last, first] (convert undefined value DISABLED)'
        );

    });



    module('getQueryContent method');

    test('Boundary tests', function() {

        strictEqual(
            _q2.getQueryContent(urls.basic),
            basicQueryContent,
            'query content get: basic'
        );
        strictEqual(
            _q2.getQueryContent(urls.withFragment),
            basicQueryContent,
            'query content get: with fragment'
        );
        strictEqual(
            _q2.getQueryContent(urls.queryOnly),
            basicQueryContent,
            'query content get: query only'
        );
        strictEqual(
            _q2.getQueryContent(urls.contentOnly),
            basicQueryContent,
            'query content get: query content only'
        );
        strictEqual(
            _q2.getQueryContent(urls.emptyStr),
            '',
            'query content get: empty string'
        );
        strictEqual(
            _q2.getQueryContent(urls.bogus),
            'not-an-url',
            'query content get: non-url string'
        );
        strictEqual(
            _q2.getQueryContent(urls.nullStr),
            'null',
            'query content get: "null" string'
        );
        strictEqual(
            _q2.getQueryContent(urls.nullVal),
            _q2.getQueryContent(window.location.href),
            'query content get: null value (casted as window.location.href)'
        );
        strictEqual(
            _q2.getQueryContent(urls.undefinedStr),
            'undefined',
            'query content get: "undefined" string'
        );
        strictEqual(
            _q2.getQueryContent(urls.undefinedVal),
            _q2.getQueryContent(window.location.href),
            'query content get: undefined value (casted as window.location.href)'
        );
    });


    module('parseQueryContent method');

    test('Basic content', function() {

        var r = _q2.parseQueryContent(urls.contentOnly);

        strictEqual(r['first'], '10', 'first param value');
        strictEqual(r['second'], '6.5', 'second param value');
        strictEqual(r['last'], 'someValue', 'last param value');

    });

    test('Mixed case params content / extended result', function() {

        var r = _q2.parseQueryContent(urls.mixedCase, undefined, true);
        var k1  = 'lowercase',
            k1l = k1.toLowerCase(),
            v1  = 'aBc12',
            k2  = 'camelCase',
            k2l = k2.toLowerCase(),
            v2  = 'dEf34';

        strictEqual(r.keys[0],          k1,     k1 + ' param name (keys)');
        strictEqual(r.keys[1],          k2,     k2 + ' param name (keys)');
        strictEqual(r.keysLC[0],        k1l,    k1 + ' param name (keys/lowercase)');
        strictEqual(r.keysLC[1],        k2l,    k2 + ' param name (keys/lowercase)');
        strictEqual(r.values[0],        v1,     k1 + ' param value (values)');
        strictEqual(r.values[1],        v2,     k2 + ' param value (values)');
        strictEqual(r.pairs[0][0],      k1,     k1 + ' param name (pairs)');
        strictEqual(r.pairs[1][0],      k2,     k2 + ' param name (pairs)');
        strictEqual(r.pairs[0][1],      v1,     k1 + ' param value (pairs)');
        strictEqual(r.pairs[1][1],      v2,     k2 + ' param value (pairs)');
        strictEqual(r.pairsLC[0][0],    k1l,    k1 + ' param name (pairs/lowercase)');
        strictEqual(r.pairsLC[1][0],    k2l,    k2 + ' param name (pairs/lowercase)');
        strictEqual(r.pairsLC[0][1],    v1,     k1 + ' param value (pairs/lowercase)');
        strictEqual(r.pairsLC[1][1],    v2,     k2 + ' param value (pairs/lowercase)');
        strictEqual(r.object[k1],       v1,     k1 + ' param value (object)');
        strictEqual(r.object[k2],       v2,     k2 + ' param value (object)');
        strictEqual(r.objectLC[k1],     v1,     k1 + ' param value (object/lowercase)');
        strictEqual(r.objectLC[k2l],    v2,     k2 + ' param value (object/lowercase)');

    });

    test('Content using names of JS object inherited props', function() {

        var r = _q2.parseQueryContent(urls.jsObjInherited);

        strictEqual(r['constructor'], '10', 'constructor param value');
        strictEqual(r['prototype'], '6.5', 'prototype param value');
        strictEqual(r['hasOwnProperty'], 'someValue', 'hasOwnProperty param value');

    });

    test('Custom param and value separators', function() {

        var k1 = 'first',
            v1 = '10',
            k2 = 'second',
            v2 = '6.5',
            k3 = 'last',
            v3 = 'someValue';

        var r1 = _q2.parseQueryContent(urls.semicolon, { paramSeparator: ';' });
        strictEqual(r1[k1], v1, 'semicolon param separator: get first param value');
        strictEqual(r1[k2], v2, 'semicolon param separator: get second param value');
        strictEqual(r1[k3], v3, 'semicolon param separator: get last param value');

        var r2 = _q2.parseQueryContent(urls.entity, { paramSeparator: '&amp;' });
        strictEqual(r2[k1], v1, '&amp; param separator: get first param value');
        strictEqual(r2[k2], v2, '&amp; param separator: get second param value');
        strictEqual(r2[k3], v3, '&amp; param separator: get last param value');

        var r3 = _q2.parseQueryContent(urls.custom, { paramSeparator: '|', valueSeparator: ':' });
        strictEqual(r3[k1], v1, 'custom param and value separators: get first param value');
        strictEqual(r3[k2], v2, 'custom param and value separators: get second param value');
        strictEqual(r3[k3], v3, 'custom param and value separators: get last param value');

    });


    module('listQueryParams method');

    test('Basic content', function() {

        var r = _q2.listQueryParams(urls.contentOnly);

        strictEqual(r['first'], '10', 'first param value');
        strictEqual(r['second'], '6.5', 'second param value');
        strictEqual(r['last'], 'someValue', 'last param value');

    });

    test('Mixed case params content / extended result', function() {

        var r = _q2.listQueryParams(urls.mixedCase, undefined, true);
        var k1  = 'lowercase',
            k1l = k1.toLowerCase(),
            v1  = 'aBc12',
            k2  = 'camelCase',
            k2l = k2.toLowerCase(),
            v2  = 'dEf34';

        strictEqual(r.keys[0],          k1,     k1 + ' param name (keys)');
        strictEqual(r.keys[1],          k2,     k2 + ' param name (keys)');
        strictEqual(r.keysLC[0],        k1l,    k1 + ' param name (keys/lowercase)');
        strictEqual(r.keysLC[1],        k2l,    k2 + ' param name (keys/lowercase)');
        strictEqual(r.values[0],        v1,     k1 + ' param value (values)');
        strictEqual(r.values[1],        v2,     k2 + ' param value (values)');
        strictEqual(r.pairs[0][0],      k1,     k1 + ' param name (pairs)');
        strictEqual(r.pairs[1][0],      k2,     k2 + ' param name (pairs)');
        strictEqual(r.pairs[0][1],      v1,     k1 + ' param value (pairs)');
        strictEqual(r.pairs[1][1],      v2,     k2 + ' param value (pairs)');
        strictEqual(r.pairsLC[0][0],    k1l,    k1 + ' param name (pairs/lowercase)');
        strictEqual(r.pairsLC[1][0],    k2l,    k2 + ' param name (pairs/lowercase)');
        strictEqual(r.pairsLC[0][1],    v1,     k1 + ' param value (pairs/lowercase)');
        strictEqual(r.pairsLC[1][1],    v2,     k2 + ' param value (pairs/lowercase)');
        strictEqual(r.object[k1],       v1,     k1 + ' param value (object)');
        strictEqual(r.object[k2],       v2,     k2 + ' param value (object)');
        strictEqual(r.objectLC[k1],     v1,     k1 + ' param value (object/lowercase)');
        strictEqual(r.objectLC[k2l],    v2,     k2 + ' param value (object/lowercase)');

    });

    test('Content using names of JS object inherited props', function() {

        var r = _q2.listQueryParams(urls.jsObjInherited);

        strictEqual(r['constructor'], '10', 'constructor param value');
        strictEqual(r['prototype'], '6.5', 'prototype param value');
        strictEqual(r['hasOwnProperty'], 'someValue', 'hasOwnProperty param value');

    });


    module('Options');

    test('Getting, setting and resetting', function() {

        var optionName;
        var od = {
            // Options used for both query parsing and query building
            paramSeparator:         '&',
            valueSeparator:         '=',
            urlEncodeAndDecode:     true,
            trimWhitespaces:        false,
            skipEmptyParamNames:    true,
            // Options used for query parsing and param getting
            paramNameCaseIgnore:    true,
            parseConvertZero:       true,
            parseConvertBool:       true,
            parseConvertYesNo:      false,
            parseConvertNull:       true,
            parseConvertUndefined:  true,
            specialValueCaseIgnore: false,
            listParamsAsPairs:      false,
            // Options used for query building
            buildSkipNull:          false,
            buildSkipUndefined:     true,
            buildConvertBoolToNum:  false,
            separateEmptyValues:    true,
            queryQuestionMark:      'auto'
        };
        var oo = {
            paramSeparator: ';',
            urlEncodeAndDecode: false,
            parseConvertBool: false,
            nonexistentOption: true
        };

        // Pre-reset options and check their values
        _q2.resetOptions();
        var or1  = _q2.getOptions();
        deepEqual(or1, od, 'check option values after pre-resetting them');

        // Set options and check their resulting values
        _q2.setOptions(oo);
        var os  = _q2.getOptions();
        for (optionName in od) {
            if (od.hasOwnProperty(optionName)) {
                if (oo[optionName] !== undefined) {
                    strictEqual(os[optionName], oo[optionName], optionName + ' option value after setting options (CHANGED option)');
                } else {
                    strictEqual(os[optionName], od[optionName], optionName + ' option value after setting options (unchanged option)');
                }
            }
        }

        // Check for nonexistent option after setting options
        strictEqual(os.nonexistentOption, undefined, 'unexsistant option value after setting options');

        // Post-reset options and check their values again
        _q2.resetOptions();
        var or2  = _q2.getOptions();
        deepEqual(or2, od, 'check option values after post-resetting them');

    });


    module('Cache');

    test('Initializing, getting, filling, using, obsoleting and purging', function() {

        // An example of clear cache
        var ccx = {
            queryContent: {},
            queryParams: {}
        };
        var cqpx = {
            keys:       [ 'first', 'second', 'last' ],
            keysLC:     [ 'first', 'second', 'last' ],
            values:     [ '10', '6.5', 'someValue' ],
            pairs:   [ [ 'first', '10' ], [ 'second', '6.5' ], ['last', 'someValue'] ],
            pairsLC: [ [ 'first', '10' ], [ 'second', '6.5' ], ['last', 'someValue'] ],
            object:     { 'first': '10', 'second': '6.5', 'last': 'someValue' },
            objectLC:   { 'first': '10', 'second': '6.5', 'last': 'someValue' }
        };

        // Pre-purge cache and check its content
        _q2.purgeCache();
        var c0 = _q2.getCache();
        deepEqual(c0, ccx, 'pre-purged cache is clear');

        // Engage and check queryContent cache
        _q2.getQueryContent(urls.basic); // calling method just to engage cache, no output needed
        var c1 = _q2.getCache();
        var cqc = c1.queryContent; // query content cache to use some following asserts
        ok(cqc.hasOwnProperty(urls.basic), 'getQueryContent: query CONTENT cache key succesfully created');
        deepEqual(cqc[urls.basic], basicQueryContent, 'getQueryContent: query CONTENT cache has proper content');
        deepEqual(c1.queryParams, {}, 'getQueryContent: query PARAMS cache left untouched');

        // Engage and check queryParams cache
        _q2.listQueryParams(urls.basic); // calling method just to engage cache, no output needed
        var c2 = _q2.getCache();
        var cqp = c2.queryParams; // query params cache to use some following asserts
        ok(cqp.hasOwnProperty(basicQueryContent), 'listQueryParams: query PARAMS cache key succesfully created');
        deepEqual(cqp[basicQueryContent], cqpx, 'listQueryParams: query PARAMS cache has proper content');
        strictEqual(c2.queryContent, cqc, 'listQueryParams: query CONTENT cache left untouched'); // must be the same object (=== comparison)

        // Call getQueryParam that uses existing cache
        _q2.getQueryParam('first', urls.basic); // calling method just to engage cache, no output needed
        var c3 = _q2.getCache();
        strictEqual(c3.queryContent, cqc, 'getQueryParam: query CONTENT cache left untouched'); // must be the same object (=== comparison)
        strictEqual(c3.queryParams, cqp, 'getQueryParam: query PARAMS cache left untouched'); // must be the same object (=== comparison)

        // Change an option that leaves cache queryParams untoched
        _q2.setOptions({ buildSkipNull: true });
        var c4 = _q2.getCache();
        strictEqual(c4.queryContent, cqc, 'setOptions { buildSkipNull: true }: query CONTENT cache left untouched'); // must be the same object (=== comparison)
        strictEqual(c4.queryParams, cqp, 'setOptions { buildSkipNull: true }: query PARAMS cache left untouched'); // must be the same object (=== comparison)

        // Set but not change (same value) urlEncodeAndDecode option that obsoletes queryParams cache when changed
        _q2.setOptions({ urlEncodeAndDecode: true });
        var c5 = _q2.getCache();
        strictEqual(c5.queryContent, cqc, 'setOptions { urlEncodeAndDecode: true }: query CONTENT cache left untouched'); // must be the same object (=== comparison)
        strictEqual(c5.queryParams, cqp, 'setOptions { urlEncodeAndDecode: true }: query PARAMS cache left untouched'); // must be the same object (=== comparison)

        // Change urlEncodeAndDecode option that obsoletes queryParams cache
        _q2.setOptions({ urlEncodeAndDecode: false });
        var c6 = _q2.getCache();
        strictEqual(c6.queryContent, cqc, 'setOptions { urlEncodeAndDecode: false }: query CONTENT cache left untouched'); // must be the same object (=== comparison)
        deepEqual(c6.queryParams, {}, 'setOptions { urlEncodeAndDecode: false }: query PARAMS cache obsoleted successfully'); // must be cleared

        // Post-purge cache and check its content
        _q2.purgeCache();
        var c9 = _q2.getCache();
        deepEqual(c9, ccx, 'post-purged cache is clear');

    });

})();
