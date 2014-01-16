/**
 * q2.js: Javascript URL query tools
 * Javascript library for parsing and building URL query strings,
 * and retrieving parameter values from them
 * @see https://github.com/thybzi/q2
 *
 * @author Evgeni Dmitriev <thybzi@gmail.com>
 * @version 0.0.1
 *
 * @TODO
 * - use ? and # as separators?
 * - tests, tests, tests!
 */
(function() {
    'use strict';

    /**
     * q2.js: Javascript URL query tools
     * @static
     * @class _q2
     * @namespace
     */
    var _q2  = {};
    // Globalize object
    var window  = this;
    window._q2 = _q2;


    // Global options and their defaults
    var options;
    var optionsDefaults = {
        // Options used for both query parsing and query building
        paramSeparator:         '&',
        valueSeparator:         '=',
        urlEncodeAndDecode:     true,   // URL-encode and decode param names and values when parsing/building
        trimWhitespaces:        false,  // remove leading/trailing \s in param names and values when parsing/building
        skipEmptyParamNames:    true,   // skip '' name when building query, and &&, &=& and &=someValue& when parsing
        // Options used for query parsing and param getting
        paramNameCaseIgnore:    true,   // getQueryParam() ignores case for both input and URL query params
        parseConvertZero:       true,   // a=0&b=1&c=5     => { a: 0, b: '1', c: '5' }
        parseConvertBool:       true,   // a=true&b=false  => { a: true, b: false } (not 'true'/'false' strings)
        parseConvertYesNo:      false,  // a=yes&b=no      => { a: true, b: false } (not 'yes'/'no' strings)
        parseConvertNull:       true,   // a=null          => { a: null }           (not 'null' string)
        parseConvertUndefined:  true,   // a=undefined     => { a: undefined }      (not 'undefined' string)
        specialValueCaseIgnore: false,  // a=tRUe&b=NuLl   => { a: true, b: null }  (not 'tRUe'/'NuLl' strings)
        listParamsAsPairs:      false,  // listQueryParams() returns pairs array instead of object
        // Options used for query building
        buildSkipNull:          false,  // { a: 10, b: null, c: 2 }        => a=10&c=2    (not a=10&b=null&c=2)
        buildSkipUndefined:     true,   // { a: 10, b: undefined, c: 2 }   => a=10&c=2    (not a=10&b=undefined&c=2)
        buildConvertBoolToNum:  false,  // { a: true, b: false }           => a=1&b=0     (not a=true&b=false)
        separateEmptyValues:    true,   // { a: 10, b: '', c: 2 }          => a=10&b=&c=2 (not a=10&b&c=2)
        queryQuestionMark:      'auto'  // true: always; false: never; 'auto': non-empty query only
    };

    // Global parsing cache
    var cache;


    /**
     * Gets value of query param, or first found of alternative params ('first found of these')
     *
     * @method getQueryParam
     * @memberof _q2#
     * @param {String|String[]} paramName String containing param name, or array containing param alternatives names
     * @param {String} [url=window.document.location] URL to get value from
     * @param {Object} [optionsOverriden={}] Options to be temporary overriden (see {@link _q2#setOptions setOptions})
     * @returns {String|Number|Boolean|Undefined} A value of param, commonly a string.
     *     In some cases (depending on {@link _q2#setOptions|options}), 0 (number) or boolean value can be returned.
     *     If param(s) doesn't exist in URL query, undefined is returned
     *
     * @example
     *     // Basic usage
     *     var myUrl = 'http://example.com/?firstParam=10&otherOne=6.5&theLast=someValue';
     *     _q2.getQueryParam('firstParam', myUrl);      // => '10'
     *     _q2.getQueryParam('otherOne', myUrl);        // => '6.5'
     *     _q2.getQueryParam('theLast', myUrl);         // => 'someValue'
     *     _q2.getQueryParam('unexistantParam', myUrl); // => undefined
     *
     * @example
     *     // Case (in)sensivity:
     *     var myUrl = 'http://example.com/?firstParam=10&otherOne=6.5&theLast=someValue';
     *     _q2.getQueryParam('firstParam', myUrl);                                 // => '10'
     *     _q2.getQueryParam('firstparam', myUrl);                                 // => '10'
     *     _q2.getQueryParam('FiRSTpaRaM', myUrl);                                 // => '10'
     *     _q2.getQueryParam('firstparam', myUrl, { paramNameCaseIgnore: false }); // => undefined
     *
     * @example
     *     // Alternative params ('first found of these'):
     *     var myUrl = 'http://example.com/?firstParam=10&otherOne=6.5&theLast=someValue';
     *     _q2.getQueryParam([ 'firstParam', 'lastParam' ], myUrl);      // => '10'
     *     _q2.getQueryParam([ 'lastParam', 'firstParam' ], myUrl);      // => 'someValue'
     *     _q2.getQueryParam([ 'unexistantParam', 'lastParam' ], myUrl); // => 'someValue'
     *
     * @example
     *     // Boolean and zero conversion:
     *     var myUrl = 'http://example.com/?trueVal=true&falseVal=false&zeroVal=0';
     *     _q2.getQueryParam('trueVal', myUrl);                                     // => true
     *     _q2.getQueryParam('falseVal', myUrl);                                    // => false
     *     _q2.getQueryParam('zeroVal', myUrl);                                     // => 0
     *     _q2.getQueryParam('falseVal', myUrl, { parseConvertBool: false }); // => 'false' (JS casts as true)
     *     _q2.getQueryParam('zeroVal', myUrl, { parseConvertZero: false });  // => '0' (JS casts as true)
     *
     * @example
     *     // Skipping empty param names:
     *     var myUrl = 'http://example.com/?param1=10&=20';
     *     _q2.getQueryParam('param1', myUrl);                            // => '10'
     *     _q2.getQueryParam('', myUrl);                                  // => undefined
     *     _q2.getQueryParam('', myUrl, { skipEmptyParamNames: false }); // => '20'
     */
    _q2.getQueryParam = function(paramName, url, optionsOverriden)
    {
        // If input is array of param names, go through it, returning first non-undefined value found
        if (isArray(paramName)) {
            var paramValue = undefined;
            for (var i = 0; i < paramName.length; i++) {
                paramValue = _q2.getQueryParam(paramName[i], url, optionsOverriden);
                if (paramValue !== undefined) {
                    break;
                }
            }
            return paramValue;
        }
        // Prepare resulting options
        var o = combineOptionsWith(optionsOverriden);
        // Pre-proocess input param name
        if (o.urlEncodeAndDecode) {
            paramName = decodeURIComponent(paramName);
        }
        if (o.trimWhitespaces) {
            paramName = trimWhitspaces(paramName);
        }
        if (o.paramNameCaseIgnore) {
            paramName = paramName.toLowerCase();
        }
        // List param names and values to search in
        var qp      = _q2.listQueryParams(url, optionsOverriden, true);
        var keys    = qp[o.paramNameCaseIgnore ? 'keysLC' : 'keys'];
        var values  = qp.values;

        return values[keys.indexOf(paramName)];
    };

    /**
     * Lists all query params and their values from the URL provided
     *
     * @method listQueryParams
     * @memberof _q2#
     * @param {String} [url=window.document.location] URL to list params from
     * @param {Object} [optionsOverriden={}] Options to be temporary overriden (see {@link _q2#setOptions setOptions})
     * @param {Boolean} [useExtendedOutput=false] Include all available subkeys in output (see examples below)
     * @returns {Object} Param names and values listed (see examples)
     *
     * @example
     *     // Basic output (useExtendedOutput = false):
     *     var myUrl = 'http://example.com/?firstParam=10&otherOne=6.5&theLast=someValue';
     *     _q2.listQueryParams(myUrl);
     *     // => { 'firstParam': '10', 'otherOne': '6.5', 'theLast': 'someValue' }
     *
     * @example
     *     // Extended output (useExtendedOutput = true):
     *     var myUrl = 'http://example.com/?firstParam=10&otherOne=6.5&theLast=someValue';
     *     _q2.listQueryParams(myUrl, undefined, true);
     *     // => {
     *     //     keys:       [ 'firstParam', 'otherOne', 'theLast' ],
     *     //     keysLC:     [ 'firstparam', 'otherone', 'thelast' ],
     *     //     values:     [ '10', '6.5', 'someValue' ],
     *     //     pairs:   [ [ 'firstParam', '10' ], [ 'otherOne', '6.5' ], [ 'theLast', 'someValue' ] ],
     *     //     pairsLC: [ [ 'firstparam', '10' ], [ 'otherone', '6.5' ], [ 'thelast', 'someValue' ] ],
     *     //     object:     { 'firstParam': '10', 'otherOne': '6.5', 'theLast': 'someValue' },
     *     //     objectLC:   { 'firstparam': '10', 'otherone': '6.5', 'thelast': 'someValue' }
     *     // }
     */
    _q2.listQueryParams = function(url, optionsOverriden, useExtendedOutput)
    {
        var queryContent = _q2.getQueryContent(url, optionsOverriden);
        return _q2.parseQueryContent(queryContent, optionsOverriden, useExtendedOutput);
    };

    /**
     * Parses query content string provided, listing all query params and their values.
     * Uses result from cache, if available. Saves result to cache, if available
     *
     * @method parseQueryContent
     * @memberof _q2#
     * @param {String} queryContent URL substring between (but not including) ? and #
     * @param {Object} [optionsOverriden={}] Options to be temporary overriden (see {@link _q2#setOptions setOptions})
     * @param {Boolean} [useExtendedResult=false] Include all available subkeys in output (see examples below)
     * @returns {Object} Param names and values listed (see examples for {@link _q2#listQueryParams listQueryParams})
     */
    _q2.parseQueryContent = function(queryContent, optionsOverriden, useExtendedResult)
    {
        var o = combineOptionsWith(optionsOverriden);
        var c = getUsableCache(optionsOverriden);
        var result;

        queryContent = queryContent || '';

        if (c.queryParams[queryContent] !== undefined) {
            // Result found in cache
            result = c.queryParams[queryContent];

        } else {
            // No cached result available

            // Prepare blank result
            result = {
                keys:       [],
                keysLC:     [],
                values:     [],
                pairs:      [],
                pairsLC:    [],
                object:     {},
                objectLC:   {}
            };

            // Split query content by param separator
            var pts = queryContent.split(o.paramSeparator);
            var parts = [];
            var i;
            for (i = 0; i < pts.length; i++) {
                if (pts[i].length) {
                    parts.push(pts[i]);
                }
            }

            // Process each part as param name and value
            var pair,
                paramName,
                paramNameLC,
                paramValue,
                paramValueCp;
            for (i = 0; i < parts.length; i++) {
                // Get raw param name and value
                pair        = parts[i].split(o.valueSeparator);
                paramName   = pair[0];
                paramValue  = pair[1] || '';
                // Decode and trim whitespaces, if we have to
                if (o.urlEncodeAndDecode) {
                    paramName   = decodeURIComponent(paramName);
                    paramValue  = decodeURIComponent(paramValue);
                }
                if (o.trimWhitespaces) {
                    paramName   = trimWhitspaces(paramName);
                    paramValue  = trimWhitspaces(paramValue);
                }
                // Handle skipping empty param names
                if (o.skipEmptyParamNames && (paramName === '')) {
                    continue;
                }
                // Lowercase param name and value (if needed)
                paramNameLC = paramName.toLowerCase();
                paramValueCp = o.specialValueCaseIgnore ? paramValue.toLowerCase() : paramValue;
                // Covert special values
                if (o.parseConvertBool) {
                    if (paramValueCp === 'true') {
                        paramValue = true;
                    } else if (paramValueCp === 'false') {
                        paramValue = false;
                    }
                }
                if (o.parseConvertYesNo) {
                    if (paramValueCp === 'yes') {
                        paramValue = true;
                    } else if (paramValueCp === 'no') {
                        paramValue = false;
                    }
                }
                if (o.parseConvertNull && (paramValueCp === 'null')) {
                    paramValue = null;
                }
                if (o.parseConvertUndefined && (paramValueCp === 'undefined')) {
                    paramValue = null;
                }
                if (o.parseConvertZero && (paramValue === '0')) {
                    paramValue = 0;
                }

                // Fill result subkeys
                result.keys.push(paramName);
                result.keysLC.push(paramNameLC);
                result.values.push(paramValue);
                result.pairs.push([ paramName, paramValue ]);
                result.pairsLC.push([ paramNameLC, paramValue ]);
                result.object[paramName] = paramValue;
                result.objectLC[paramNameLC] = paramValue;
            }

            // Only write to global cache if local cache is same as global (c === cache)
            c.queryParams[queryContent] = result;
        }

        // Return correspondent subkey, or the entire result object
        if (useExtendedResult) {
            return result;
        } else if (o.listParamsAsPairs) {
            return result.pairs;
        } else {
            return result.object;
        }
    };

    /**
     * Parses URL and gets query content string from it: substring between (but not including) ? and #.
     * Uses result from cache, if available. Saves result to cache, if available
     *
     * @method getQueryContent
     * @memberof _q2#
     * @param {String} [url=window.document.location] URL to get value from
     * @param {Object} [optionsOverriden={}] Options to be temporary overriden (see {@link _q2#setOptions setOptions})
     * @returns {String} Query content string, or (at least) an empty string
     */
    _q2.getQueryContent = function(url, optionsOverriden)
    {
        url = provideUrl(url);
        var o = combineOptionsWith(optionsOverriden);
        var c = getUsableCache(optionsOverriden);

        // Return cached result, if available
        if (c.queryContent[url] !== undefined) {
            return c.queryContent[url];
        }

        var queryContent;
        if (separatorsContainBoundaryChars(o)) {
            // If any of separators contain '?' or '#' chars, use full URL
            queryContent = url;
        } else {
            // Otherwise, retrieve query part from URL
            var mask = /^([^\?]*\?)?([^#]*)/i;
            queryContent = url.match(mask)[2];
        }

        // Only write to global cache if local cache is same as global (c === cache)
        c.queryContent[url] = queryContent;

        return queryContent;
    };

    /**
     * Builds query string from object or array containing params and their values.
     * If resulting query is not empty, output starts from question mark
     *
     * @method buildQuery
     * @memberof _q2#
     * @param {Object|Array[]} params An object containing params and values, or an array containing param-value pairs
     * @param {Object} [optionsOverriden={}] Options to be temporary overriden (see {@link _q2#setOptions setOptions})
     * @returns {String} Query content string, or (at least) an empty string
     *
     * @example
     *     // Building from object:
     *     var myParams = { someParam: 10, otherOne: 6.5, foo: 'bar' };
     *     _q2.buildQuery(myParams); // => '?someParam=10&otherOne=6.5&foo=bar'
     *
     * @example
     *     // Building from pairs array:
     *     var myParams = [ [ 'someParam', 10 ], [ 'otherOne', 6.5 ], [ 'foo', 'bar' ] ];
     *     _q2.buildQuery(myParams); // => '?someParam=10&otherOne=6.5&foo=bar'
     *
     * @example
     *     // Empty input (and result):
     *     var myParams = {};
     *     _q2.buildQuery(myParams); // => ''
     */
    _q2.buildQuery = function(params, optionsOverriden)
    {
        var o = combineOptionsWith(optionsOverriden);

        // Convert object-based params to pairs array
        if (!isArray(params)) {
            params = objectToPairs(params);
        }

        // Go through pairs array to fill 'name=value' query parts
        var parts = [];
        var paramName,
            paramValue;
        for (var i = 0; i < params.length; i++) {
            // Get param name and value from pairs array
            paramName   = params[i][0];
            paramValue  = params[i][1];
            // Trim whitespaces off param name and value, if we have to
            if (o.trimWhitespaces) {
                paramName   = trimWhitspaces(paramName);
                paramValue  = trimWhitspaces(paramValue);
            }
            // Handle skipped param names and values
            if (o.skipEmptyParamNames && (paramName === '')) {
                continue;
            }
            if (o.buildSkipUndefined && (paramValue === undefined)) {
                continue;
            }
            if (o.buildSkipNull && (paramValue === null)) {
                continue;
            }
            // Convert booleans to numbers, if we have to
            if (o.buildConvertBoolToNum && isBool(paramValue)) {
                paramValue  = paramValue ? 1 : 0;
            }
            // URL-encode param name and value, if we have to
            if (o.urlEncodeAndDecode) {
                paramName   = encodeURIComponent(paramName);
                paramValue  = encodeURIComponent(paramValue);
            }
            // Join param name and value
            if ((paramValue === '') && !o.separateEmptyValues) {
                parts.push(paramName);
            } else {
                parts.push(paramName + o.valueSeparator + paramValue);
            }
        }
        // Join query parts
        var result = parts.join(o.paramSeparator);

        // Add leading question mark, if we have to
        var qm = o.queryQuestionMark;
        // Any non-boolean value for o.queryQuestionMark is treated as 'auto'
        if ((qm === true) || (result.length && (qm !== false))) {
            result = '?' + result;
        }

        return result;
    };

    /**
     * Initializes global options with their default values
     *
     * @method initOptions
     * @memberof _q2#
     * @see optionsDefaults
     */
    _q2.initOptions = function()
    {
        options = {};
        for (var i in optionsDefaults) {
            if (optionsDefaults.hasOwnProperty(i)) {
                options[i] = optionsDefaults[i];
            }
        }
    };
    /**
     * Alias of {@link _q2#initOptions initOptions}
     *
     * @method resetOptions
     * @memberof _q2#
     */
    _q2.resetOptions = _q2.initOptions;

    /**
     * Overrides global options with values provided.
     * Partially purges global cache, if needed
     *
     * @method setOptions
     * @memberof _q2#
     * @param {Object} optionsOverriden An object containing option names and values to override; some of the following:
     * @param {String} [optionsOverriden.paramSeparator='&'] A string separating one query param from another
     * @param {String} [optionsOverriden.valueSeparator='='] A string separating param name from its value
     * @param {Boolean} [optionsOverriden.urlEncodeAndDecode=true] URL-encode and decode param names and values when parsing/building
     * @param {Boolean} [optionsOverriden.trimWhitespaces=false] Remove leading/trailing \s in param names and values when parsing/building
     * @param {Boolean} [optionsOverriden.skipEmptyParamNames=true] Skip '' name when building query, and &&, &=& and &=someValue& when parsing
     * @param {Boolean} [optionsOverriden.paramNameCaseIgnore=true] getQueryParam() ignores case for both input and URL query params
     * @param {Boolean} [optionsOverriden.parseConvertZero=true] Convert '0' value to 0 (number) when parsing query
     * @param {Boolean} [optionsOverriden.parseConvertBool=true] Convert 'true'/'false' values to correspondent booleans when parsing query
     * @param {Boolean} [optionsOverriden.parseConvertYesNo=false] Convert 'yes'/'no' values to true/false booleans when parsing query
     * @param {Boolean} [optionsOverriden.parseConvertNull=true] Convert 'null' value to real JS null value when parsing query
     * @param {Boolean} [optionsOverriden.parseConvertUndefined=true] Convert 'undefined' value to real JS undefined when parsing query
     * @param {Boolean} [optionsOverriden.specialValueCaseIgnore=false] Ignore value case when converting 'true', 'false', 'yes', 'no', 'null' and 'undefined' values
     * @param {Boolean} [optionsOverriden.listParamsAsPairs=false] listQueryParams() returns [ name, value ] pairs array instead of object
     * @param {Boolean} [optionsOverriden.buildSkipNull=false] Skip params with null value when building query
     * @param {Boolean} [optionsOverriden.buildSkipUndefined=true] Skip params with undefined value when building query
     * @param {Boolean} [optionsOverriden.buildConvertBoolToNum=false] Convert boolean values to 0 and 1 when building query
     * @param {Boolean} [optionsOverriden.separateEmptyValues=true] Add value separator after param name even if its value is empty (e.g. a=&b=)
     * @param {Boolean|String} [optionsOverriden.queryQuestionMark='auto'] Add '?' mark before query built (true: always, false: never; 'auto': non-empty result only)
     */
    _q2.setOptions = function(optionsOverriden)
    {
        cache   = getUsableCache(optionsOverriden);
        options = combineOptionsWith(optionsOverriden);
    };

    /**
     * Exposes module global options in their current state
     *
     * @method listOptions
     * @memberof _q2#
     * @returns {Object}
     */
    _q2.listOptions = function()
    {
        return options;
    };
    /**
     * Alias of {@link _q2#listOptions listOptions}
     *
     * @method getOptions
     * @memberof _q2#
     */
    _q2.getOptions = _q2.listOptions;

    /**
     * Exposes module global cache in their current state
     *
     * @method getCache
     * @memberof _q2#
     * @returns {Object}
     */
    _q2.getCache = function()
    {
        return cache;
    };

    /**
     * Initializes global cache with empty subkeys
     *
     * @method initCache
     * @memberof _q2#
     */
    _q2.initCache = function()
    {
        cache = {
            queryContent: {},
            queryParams: {}
        };
    };
    /**
     * Alias of {@link _q2#initCache initCache}
     *
     * @method getOptions
     * @memberof _q2#
     */
    _q2.purgeCache = _q2.initCache;



    // Internal utility functions

    /** @private */
    var isString = function(input)
    {
        return (typeof input === 'string');
    };
    /** @private */
    var isArray = function(input)
    {
        return (input !== undefined) && input instanceof Array;
    };
    /** @private */
    var isBool = function(input)
    {
        return (input === true) || (input === false);
    };

    /**
     * Trims all leading and trailing whitespace from string
     *
     * @private
     * @param {String} input
     * @returns {String}
     */
    var trimWhitspaces = function(input)
    {
        return input.replace(/^\s*/, '').replace(/\s*$/, '');
    };

    /**
     * Converts an object to array of [ key, value ] arrays
     *
     * @private
     * @param {Object} object
     * @returns {Array[]}
     */
    var objectToPairs = function(object)
    {
        var pairs = [];
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                pairs.push([ i, object[i] ]);
            }
        }
        return pairs;
    };

    /**
     * Return URL passed if it's a string, window.location.href otherwise
     *
     * @private
     * @param {String} [url=window.location.href]
     * @returns {String}
     */
    var provideUrl = function(url)
    {
        return isString(url) ? url : window.location.href;
    };

    /**
     * Detects whether string contains '?' or '#' char
     *
     * @private
     * @param {String} input
     * @returns {Boolean}
     */
    var containsBoundaryChars = function(input)
    {
        return (input.indexOf('?') !== -1) || (input.indexOf('#') !== -1);
    };

    /**
     * Detects if options passed have any separator containing '?' or '#'
     *
     * @private
     * @param {Object} options
     * @returns {Boolean}
     */
    var separatorsContainBoundaryChars = function(options)
    {
        var paramSeparatorDoes = ((options.paramSeparator !== undefined) && containsBoundaryChars(options.paramSeparator));
        var valueSeparatorDoes = ((options.valueSeparator !== undefined) && containsBoundaryChars(options.valueSeparator));
        return paramSeparatorDoes || valueSeparatorDoes;
    };

    /**
     * Combines global options with overrides passed, returning result
     * The global options themselves kept untouched
     *
     * @private
     * @param {Object} [optionsOverriden={}]
     * @returns {Object}
     */
    var combineOptionsWith = function(optionsOverriden)
    {
        var oo = optionsOverriden || {};
        var o = {};
        for (var optionName in options) {
            if (options.hasOwnProperty(optionName)) {
                o[optionName] = (oo[optionName] !== undefined) ? oo[optionName] : options[optionName];
            }
        }
        return o;
    };

    /**
     * Detects whether option value is overriden in object passed
     *
     * @private
     * @param {String} optionName
     * @param {Object} optionsOverriden
     * @returns {Boolean}
     */
    var optionOverriden = function(optionName, optionsOverriden)
    {
        var oo = optionsOverriden;
        return oo && (oo[optionName] !== undefined) && (oo[optionName] !== options[optionName]);
    };

    /**
     * Detects whether at least one of options listed is overriden in object passed
     *
     * @private
     * @param {String[]} optionNames
     * @param {Object} optionsOverriden
     * @returns {Boolean}
     */
    var anyOptionOverriden = function(optionNames, optionsOverriden)
    {
        for (var i = 0; i < optionNames.length; i++) {
            if (optionOverriden(optionNames[i], optionsOverriden)) {
                return true;
            }
        }
        return false;
    };

    /**
     * Provides the cache usable with options overrides passed
     *
     * @private
     * @param {Object} optionsOverriden
     * @returns {Object}
     */
    var getUsableCache = function(optionsOverriden)
    {
        var separatorsOptions = [ 'paramSeparator', 'valueSeparator' ];
        var separatorsChanged = anyOptionOverriden(separatorsOptions, optionsOverriden);
        var obsoleteQueryContent = separatorsChanged && separatorsContainBoundaryChars(optionsOverriden);

        var queryParamsObsoleters = [
            'urlEncodeAndDecode',
            'trimWhitespaces',
            'skipEmptyParamNames',
            'parseConvertZero',
            'parseConvertBool',
            'parseConvertYesNo',
            'parseConvertNull',
            'parseConvertUndefined',
            'specialValueCaseIgnore'
        ];
        var obsoleteQueryParams = separatorsChanged || anyOptionOverriden(queryParamsObsoleters, optionsOverriden);

        if (!obsoleteQueryContent && !obsoleteQueryParams) {
            return cache;
        } else {
            return {
                queryContent: obsoleteQueryContent ? {} : cache.queryContent,
                queryParams: obsoleteQueryParams ? {} : cache.queryParams
            };
        }
    };


    // Initializing options and cache
    _q2.initOptions();
    _q2.initCache();

}).call(this);
