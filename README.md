`q2.js`: Javascript URL Query Tools
=================================
Parses URL query component, lists query params, gets params values, builds query component, and so on

Features:
-------------
- Ignores case of param names when getting values *(on by default)*
- Alternative params (*'first found of these'*) value getting available
- URL-encode/decode for both param names and values *(on by default)*
- Param and value separators configurable
- When parsing/getting, converts some string values *(on by default)*:
    - `'0'` to `0` (number) — to be casted as `false`
    - `'true'` and `'false'` to correspondent boolean values
    - `'null'` and `'undefined'` to correspondent 'real' Javascript values
- When building query, can skip params with:
    - empty param names *(on by default)*
    - `undefined` values *(on by default)*
    - `null` values *(off by default)*
- When building query, can convert `true` to `1`, and `false` to `0` *(off by default)*
- Options configurable both globally and per-operation
- Doesn't require any third-party libraries
- And more! (Check out the examples)

Usage examples:
---------------
First, include `q2.js`, e.g. add this to the `<head>` section of your webpage, like this:

```html
<script src="/path/to/q2.js" type="text/javascript"></script>
```

If using HTML5, `type` attribute can be omitted:

```html
<script src="/path/to/q2.js"></script>
```

To do things, use the methods of `_q2` variable (available globally without any initialization). And here we go.

### Basic usage:

```javascript
/* Assuming current browser URL is:
   http://example.com/?someParam=10&otherParam=someValue#anchorParam=here */
_q2.getQueryParam('someParam');   // => '10'
_q2.getQueryParam('otherParam');  // => 'someValue'
_q2.getQueryParam('noSuchParam'); // => undefined (non-existent param)
_q2.getQueryParam('anchorParam'); // => undefined (non-query parts are ignored)
_q2.listQueryParams(); // => { 'someParam': '10', 'otherParam' => 'someValue' }

// Using custom URL
var myUrl = 'http://example.com/?param1=10&param2=20';
_q2.getQueryParam('param1', myUrl);   // => '10'
_q2.listQueryParams(myUrl);   // => { 'param1': '10', 'param2' => '20' }
// Or, just a query part of URL (with or without preceding '?' mark)
var myQuery = 'param1=10&param2=20';
_q2.getQueryParam('param1', myQuery); // => '10'
_q2.listQueryParams(myQuery); // => { 'param1': '10', 'param2' => '20' }
// Any non-string value will be treated as 'use current browser URL'
_q2.getQueryParam('param1', null);  // window.location.href will be used
_q2.listQueryParams(false);         // window.location.href will be used 

// Building query
var params1 = { first: 10, second: 6.5, last: 'someValue' };
_q2.buildQuery(params1); // => '?first=10&second=6.5&last=someValue'
// If params order is important for you, better use pairs array (objects are sometimes reordered in Javascript)
var params2 = [ ['first', 10], ['second', 6.5], ['last', 'someValue'] ];
_q2.buildQuery(params2); // => '?first=10&second=6.5&last=someValue'
// Undefined values and empty param names are ignored (configurable)
var params3 = { '': 10, second: 6.5, last: undefined };
_q2.buildQuery(params3); // => '?second=6.5'

```

### Demonstrating some cool features:

```javascript
/* Assuming current browser URL is:
   http://example.com/?someParam=10&otherParam=someValue */

// Param name case is ignored by default (configurable)
_q2.getQueryParam('otherparam');  // => 'someValue'
_q2.getQueryParam('OthErpARaM');  // => 'someValue'

// Alternative params getting ('first found of these')
_q2.getQueryParam(['someparam', 'otherparam']);  // => '10'
_q2.getQueryParam(['otherparam', 'someparam']);  // => 'someValue'
_q2.getQueryParam(['noSuchParam', 'someparam']); // => '10'
_q2.getQueryParam(['noSuchParam', 'badparam']);  // => undefined

// Smart values conversion (configurable)
var smartVals = 'zero=0&truly=true&falsy=false&nully=null&undef=undefined';
_q2.getQueryParam('zero',  smartVals); // => 0 (number, casted as false)
_q2.getQueryParam('truly', smartVals); // => true (boolean)
_q2.getQueryParam('falsy', smartVals); // => false (boolean)
_q2.getQueryParam('nully', smartVals); // => null (real JS value)
_q2.getQueryParam('undef', smartVals); // => undefined (real JS value)

// That also works when listing all params
_q2.listQueryParams(smartVals); 
// => { 'zero': 0, 'truly': true, 'falsy': false, 'nully': null, 'undef': undefined }
```

### Using options:
(For full list of options, see **Options configurable** below)

```javascript

// Disable case-ignore for param names
var url1 = 'http://example.com/?firstParam=10&lastParam=20';
var opt1 = { paramNameCaseIgnore: false };
_q2.getQueryParam('firstparam', url1);       // => 10
_q2.getQueryParam('firstparam', url1, opt1); // => undefined

// Disable conversion of zero and booleans
var url2 = 'http://example.com/?zero=0&falsy=false';
var opt2 = { parseConvertZero: false, parseConvertBool: false };
_q2.getQueryParam('zero',  url2);       // => 0 (number, casted as false)
_q2.getQueryParam('zero',  url2, opt2); // => '0' (string, casted as true)
_q2.getQueryParam('falsy', url2);       // => false (boolean value)
_q2.getQueryParam('falsy', url2, opt2); // => 'false' (string, casted as true)

// List params as pairs array (safer for keeping params order, duplicate param names, JS special property names, etc)
var url3 = 'http://example.com/?first=1&second=2&last=3';
var opt3 = { listParamsAsPairs: true };
_q2.listQueryParams(url3);       // => { 'first': '1', 'second': '2', 'last': '3' }
_q2.listQueryParams(url3, opt3); // => [ ['first', '1'], ['second', '2'], ['last', '3'] ]

// Using custom params separators
var url4 = 'http://example.com/?first=1;second=2;last=3';
var opt4 = { paramSeparator: ';' };
_q2.listQueryParams(url4, opt4); // => { 'first': '1', 'second': '2', 'last': '3' }

// And custom value separators, too
var url5 = 'first:1,second:2,last:3';
var opt5 = { paramSeparator: ',', valueSeparator: ':' };
_q2.listQueryParams(url5, opt5); // => { 'first': '1', 'second': '2', 'last': '3' }

// Adjust params skipping when building query
var params = { 
    normal: 'someValue', 
    '': 'otherValue', 
    'nully': null, 
    'undef': undefined 
};
var opt6 = {
    skipEmptyParamNames: false,
    buildSkipNull: true,
    buildSkipUndefined: false 
};
_q2.buildQuery(params);       // '?normal=someValue&nully=null'
_q2.buildQuery(params, opt6); // '?normal=someValue&=otherValue&undef=undefined'

// Setting global options
// (no need to pass them each time; also speeds up some operations)
var myOptions = {
    paramSeparator: ';'.
    paramNameCaseIgnore: false,
    skipEmptyParamNames: false,
    buildSkipNull: true
};
// Use these values for all future operations
_q2.setOptions(myOptions);
```

Options configurable:
---------------------

Current options values can be listed with `_q2.listOptions()` or `_q2.getOptions()` (these are synonyms).

Here is the full list of **options and their default values**: 

* **paramSeparator** (*String*, defaults to `'&'`)  
  A string separating one query param from another
* **valueSeparator** (*String*, defaults to `'='`)  
  A string separating param name from its value
* **urlEncodeAndDecode** (*Boolean*, defaults to `true`)  
  URL-encode and decode param names and values when parsing/building
* **trimWhitespaces** (*Boolean*, defaults to `false`)  
  Remove leading/trailing `\s` in param names and values when parsing/building
* **skipEmptyParamNames** (*Boolean*, defaults to `true`)  
  Skip `''` name when building query, and `&&`, `&=&` and `&=someValue&` when parsing
* **paramNameCaseIgnore** (*Boolean*, defaults to `true`)  
  `getQueryParam()` ignores case for both input and URL query params
* **parseConvertZero** (*Boolean*, defaults to `true`)  
  Convert `'0'` string value to `0` (number) when parsing query
* **parseConvertBool** (*Boolean*, defaults to `true`)  
  Convert `'true'` and `'false'` string values to correspondent boolean values when parsing query
* **parseConvertYesNo** (*Boolean*, defaults to `false`)  
  Convert `'yes'` and `'no'` string values to `true`/`false` boolean values when parsing query
* **parseConvertNull** (*Boolean*, defaults to `true`)  
  Convert `'null'` string value to correspondent Javascript value when parsing query
* **parseConvertUndefined** (*Boolean*, defaults to `true`)  
  Convert `'undefined'` string value to correspondent Javascript value when parsing query
* **specialValueCaseIgnore** (*Boolean*, defaults to `false`)  
  Ignore value case when converting `'true'`, `'false'`, `'yes'`, `'no'`, `'null'` and `'undefined'` values
* **listParamsAsPairs** (*Boolean*, defaults to `false`)  
  `listQueryParams()` returns pairs array instead of object
* **specialValueCaseIgnore** (*Boolean*, defaults to `false`)  
  Ignore value case when converting `'true'`, `'false'`, `'yes'`, `'no'`, `'null'` and `'undefined'` values
* **buildSkipNull** (*Boolean*, defaults to `false`)  
  Skip params with `null` value when building query
* **buildSkipUndefined** (*Boolean*, defaults to `true`)  
  Skip params with `undefined` value when building query
* **buildConvertBoolToNum** (*Boolean*, defaults to `false`)  
  Convert boolean values to `0` and `1` when building query
* **separateEmptyValues** (*Boolean*, defaults to `true`)  
  Add value separator after param name even if its value is empty (e.g. `a=&b=`)
* **queryQuestionMark** (*Boolean*|*String*, defaults to `'auto'`)  
  Add '?' mark before query built (`true`: always, `false`: never; `'auto'`: non-empty result only)

Licence:
--------
You can *do whatever you want* with `q2.js`, it is MIT-licenced. 
Also, no warranty provided, so use this software *at your own risk*.
For full licence text, see the `LICENCE` file included.