/**
 * SITE TRAVERSER - Web Development Tool to be used within
 * bookmarklets to crawl a site and make pre-defined checks
 * ---
 * @author James Padolsey (http://james.padolsey.com)
 * @version 0.01
 * @updated 01-DEC-09
 * ---
 * @namespace window.SiteTraverser
 * @info http://github.com/jamespadolsey/SiteTraverser
 */

var SiteTraverser = (function(){
    
    var Logger = (function(){
        
        var defaults = {
            /* Logger defaults */
            style: {
                position: 'fixed',
                top: '10px',
                left: '10px',
                color: '#9AFF00',
                background: '#000',
                border: '5px solid #444',
                padding: '10px',
                fontFamily: 'consolas',
                fontSize: '12px',
                width: '300px',
                textShadow: '1px 1px 2px #FFF',
                zIndex: 9999,
                textAlign: 'right'
            },
            cursor: {
                open: 'data:image/gif;base64,AAACAAEAICACAAgACAAwAQAAFgAAACgAAAAgAAAAQAAAAAEAAQAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAA/AAAAfwAAAP+AAAH/gAAB/8AAA//AAAd/wAAGf+AAAH9gAADbYAAA2yAAAZsAAAGbAAAAGAAAAAAAAA//////////////////////////////////////////////////////////////////////////////////////gH///4B///8Af//+AD///AA///wAH//4AB//8AAf//AAD//5AA///gAP//4AD//8AF///AB///5A////5///8=',
                closed: 'data:image/gif;base64,AAACAAEAICACAAgACAAwAQAAFgAAACgAAAAgAAAAQAAAAAEAAQAAAAAAAAEAAAAAAAAAAAAAAgAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAA/AAAAfwAAAP+AAAH/gAAB/8AAAH/AAAB/wAAA/0AAANsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////////////////////////////////////////////////////////gH///4B///8Af//+AD///AA///wAH//+AB///wAf//4AH//+AD///yT/////////////////////////////8='
            }
        };
        
        var util = {
            
            el: function(type, attrs) {
                
                /* Create new element */
                var el = document.createElement(type), attr;
                
                /*Copy to single object */
                attrs = util.merge({}, attrs);
                
                /* Add attributes to el */
                if (attrs && attrs.style) {
                    var styles = attrs.style;
                    util.applyCSS( el, attrs.style );
                    delete attrs.style;
                }
                for (attr in attrs) {
                    if (attrs.hasOwnProperty(attr)) {
                        el[attr] = attrs[attr];
                    }
                }
                
                return el;
            
            },
            
            applyCSS: function(el, styles) {
                for (var prop in styles) {
                    if (styles.hasOwnProperty(prop)) {
                        try{
                            /* Yes, IE6 SUCKS! */
                            el.style[prop] = styles[prop];
                        }catch(e){}
                    }
                }
            },
            
            txt: function(t) {
                return document.createTextNode(t);
            },
            
            htmlentities: function(str) {
                return str.replace(/&(?!\S)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            },
            
            merge: function(target, source) {
                
                /* Merges two (or more) objects,
                   giving the last one precedence */
                
                if ( typeof target !== 'object' ) {
                    target = {};
                }
                
                for (var property in source) {
                    
                    if ( source.hasOwnProperty(property) ) {
                        
                        var sourceProperty = source[ property ];
                        
                        if ( typeof sourceProperty === 'object' ) {
                            target[ property ] = util.merge( target[ property ], sourceProperty );
                            continue;
                        }
                        
                        target[ property ] = sourceProperty;
                        
                    }
                    
                }
                
                for (var a = 2, l = arguments.length; a < l; a++) {
                    util.merge(target, arguments[a]);
                }
                
                return target;
            },
            
            type: function(v){
                try {
                    /* Returns type, e.g. "string", "number", "array" etc.
                       Note, this is only used for precise typing. */
                    if (v === null) { return 'NULL'; }
                    if (v === undefined) { return 'UNDEFINED'; }
                    var oType = Object.prototype.toString.call(v).match(/\s(.+?)\]/)[1].toLowerCase();
                    if (v.nodeType) {
                        if (v.nodeType === 1) {
                            return 'domelement';
                        }
                        return 'domnode';
                    }
                    if (/^(string|number|array|regexp|function|date|boolean)$/.test(oType)) {
                        return oType;
                    }
                    if (typeof v === 'object') {
                        return 'object';
                    }
                    if (v === window || v === document) {
                        return 'object';
                    }
                    return 'default';
                } catch(e) {
                    return 'default';
                }
            },
            
            stringify: function(obj, inner) {
                
                /* Bit of an ugly duckling!
                   - This fn returns an ATTEMPT at converting an object/array/anyType
                     into a string, kinda like a JSON-deParser
                   - This is used for when |settings.expanded === false| */
                
                var type = util.type(obj),
                    str, first = true;
                    
                if ( type === 'UNDEFINED' ) {
                    return type;
                }
                
                if ( type === 'string' ) {
                    return inner ? '"' + obj.replace(/"/g,'\\"') + '"' : obj;
                }
                
                if ( type === 'array' || (obj && obj.length && obj[0] !== undefined) ) {
                    str = '[';
                    for (var i = 0, l = obj.length; i < l; ++i) {
                        str += (i===0?'':', ') + util.stringify(obj[i], true);
                    }
                    return str + ']';
                }
                
                if (typeof obj === 'object') {
                    str = '{';
                    for (var i in obj){
                        if (obj.hasOwnProperty(i)) {
                            str += (first?'':', ') + i + ':' + util.stringify(obj[i], true);
                            first = false;
                        }
                    }
                    return str + '}';
                }
                
                if (type === 'regexp') {
                    return '/' + obj.source + '/';
                }
                
                if (type === 'function') {
                    return 'function ' +
                        (obj.toString().match(/^function\s*(\w+?)\s*\(/)||[,''])[1]
                    + '(' +
                        (obj.toString().match(/^function\s*\w+?\s*\((.+?)\)/)||[,''])[1]
                    + ') {...}';
                }
                
                return obj.toString();
            },
            
            shorten: function(str, n) {
                var max = n || 100;
                str = str.replace(/^\s\s*|\s\s*$|\n/g,'');
                return str.length > max ? (str.substring(0, max-1) + '...') : str;
            },
            
            addEvent: function(elem, type, handler) {
            
                var fn = function(e) {
                        return handler.call(elem, window.event || e);
                    },
                    curFn = elem['on' + type];
                    
                elem.addEventListener ?
                    elem.addEventListener( type, fn, false )
                    :elem.attachEvent ?
                        elem.attachEvent( 'on' + type, fn )
                        : elem['on' + type] = function(e) {
                            curFn.call(this, e);
                            fn(e);
                        };
                
                return true;
                
            },
            
            processMsg: function(args) {
                return util.shorten(util.stringify(args.shift())).replace(/\$(\d+)/g, function(m,i){
                    return args.length >= (i = +i) ? util.shorten(util.stringify(args[i-1])) : m;
                });
            }
            
        };
        
        var persister = {};
        
        function Logger(o) {
            
            if ( !(this instanceof Logger) ) {
                return new Logger(o);
            }
            
            this.o = o = util.merge(true, defaults, o);
            
            var self = this,
                mouseDown,
                mX, mY,
                movable;
            
            this.view = util.el('div', {
                id: o.id || '',
                className: o.className || '',
                style: o.style
            });
            
            this.view.appendChild(util.el('span', {
                innerHTML: '(CTRL-mousedown to drag)',
                style: {
                    textTransform: 'uppercase',
                    color: '#CCC',
                    fontSize: '12px',
                    paddingRight: '10px'
                }
            }));
            
            this.view.appendChild(this.closeLink = util.el('a', {
                innerHTML: 'CLOSE',
                href: '#',
                onclick: function(e) {
                    self.view.parentNode.removeChild(self.view);
                    return false;
                },
                style: {
                    textTransform: 'uppercase',
                    color: 'white',
                    fontSize: '12px'
                }
            }));
            
            this.view.appendChild(util.el('hr', {style:{
                borderColor: '#333',
                height: '1px',
                margin: '5px 0 0 0'
            }}));
            
            this.view.appendChild(this.preWrapper = util.el(
                'div',
                {style:{
                    overflow: 'auto',
                    height: '300px'
                }}
            ));
            
            this.preWrapper.appendChild(this.pre = util.el(
                'pre',
                {style:{
                    fontFamily: o.style.fontFamily || 'inherit',
                    backgroundColor: o.style.backgroundColor || 'inherit',
                    color: o.style.color || 'inherit',
                    cursor: 'inherit',
                    padding: 0,
                    margin: 0,
                    clear: 'both',
                    textAlign: 'left'
                }}
            ));
            
            document.body.appendChild(this.view);
            
            util.addEvent(document, 'keydown', function(e) {
                if (e.keyCode === 17 && !movable) {
                    self.setCSS({cursor: 'url("' + o.cursor.open + '"), pointer'});
                    movable = true;
                }
            });
            
            util.addEvent(document, 'keyup', function(e) {
                if (e.keyCode === 17) {
                    self.setCSS({cursor:''});
                    movable = false;
                }
            });
            
            util.addEvent(document, 'mousemove', function(e){
                var x = e.clientX, y = e.clientY;
                if (mouseDown) {
                    self.view.style.top = y - mY + 'px';
                    self.view.style.left = x - mX + 'px';
                }
            });
            
            util.addEvent(this.view, 'mousedown', function(e){
                if ( movable ) {
                    self.setCSS({cursor: 'url("' + o.cursor.closed + '"), pointer'});
                    mY = e.clientY - self.view.offsetTop;
                    mX = e.clientX - self.view.offsetLeft;
                    mouseDown = true;
                    return false;
                }
            });
            
            util.addEvent(document, 'mouseup', function(e){
                self.setCSS({
                    cursor: movable ? ('url("' + o.cursor.open + '"), pointer') : ''
                });
                mouseDown = false;
            });
            
        }
        
        util.merge(Logger.prototype, {
            log: function() {
                
                var o = this.o,
                    args = Array.prototype.slice.call(arguments),
                    // Replace instances of $1, $2 etc. with their respective args
                    persist = args[0] === persister ? (args.shift(), true) : false,
                    msg = util.processMsg(args),
                    span, hr;
                
                this.pre.appendChild(span = util.el('span', {
                    innerHTML: util.htmlentities(msg),
                    style: {
                        color: this.nextColor || '',
                        width: '90%',
                        display: 'block',
                        overflow: 'hidden',
                        padding: '5px 0'
                    }
                }));
                
                this.pre.appendChild(hr = util.el('hr', {style:{
                    borderColor: '#333',
                    height: '1px',
                    margin: 0
                }}));
                
                this.nextColor = null;
                
                this.preWrapper.scrollTop = 10000;
                
                return persist ? {
                    update: function() {
                        span.innerHTML = util.htmlentities(util.processMsg(
                            Array.prototype.slice.call(arguments)
                        ));
                        return this;
                    },
                    color: function(color) {
                        span.style.color = color;
                        return this;
                    },
                    remove: function() {
                        var p = span.parentNode;
                        p.removeChild(span);
                        p.removeChild(hr);
                    },
                    more: function(data){
                        
                        if (!data) { return this; }
                        
                        data = typeof data === 'string' ? data : util.htmlentities(util.stringify(data));
                        
                        span.insertBefore(util.el('span', {
                            innerHTML: '[+] ',
                            onclick: function() {
                                var visible = dataDiv.style.display !== 'none';
                                dataDiv.style.display = visible ? 'none' : 'block';
                                this.innerHTML = visible ? '[+] ' : '[-] ';
                            },
                            style: {
                                cursor: 'pointer'
                            }
                        }), span.firstChild);
                        
                        var dataDiv = span.parentNode.insertBefore( util.el('div', {
                            innerHTML: util.htmlentities(data).replace(/\n/, '<br/>'),
                            style: {
                                display: 'none',
                                color: '#DDD',
                                padding: '10px'
                            }
                        }), span.nextSibling );
                        
                        return this;
                    },
                    node: span
                } : this;
                
            },
            persistentLog: function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(persister);
                return this.log.apply(this, args);
            },
            setCSS: function(css) {
                util.applyCSS(this.view, css);
                return this;
            },
            color: function(color) {
                this.nextColor = color;
                return this;
            }
        });
        
        Logger.defaults = defaults;
        
        return Logger;
        
    })();
        
    function isInternal(url){
        return RegExp('^' + location.href.match(/.+?\/(?=[^\/])/)[0] + location.hostname).test(url);
    }
    
    function pathname(s) {
        return s.replace(/^.+?\/\/.+?(\/)/g, '$1');
    }
    
    function xhrSuccess(xhr) {
        try {
            // From jQuery, (c) John Resig
            return !xhr.status && location.protocol === "file:" ||
            ( xhr.status >= 200 && xhr.status < 300 ) || xhr.status === 304 || xhr.status === 1223;
        } catch(e){}
        return false;
    }
    
    /**
     * THE SITE TRAVERSER
     */
    function SiteTraverser( o ) {
        
        if ( !o || !o.check ) {
            return;
        }
        
        this.timeout = o.timeout || 20000;
        this.contentType = o.contentType || /^text\/html/;
        this.crawl = 'crawl' in o ? o.crawl : true;
        this.paused = true;
        this.count = 0;
        this.check = o.check;
        this.httpError = o.httpError || function(){};
        this.genericError = o.genericError || function(){};
        this.limit = o.limit || 500;
        this.done = {};
        this.urls = o.urls || [location.href.replace(/#.*$/,'')],
        this.current_url;
        this.logger = new Logger({ style: {width: '600px'}});
        
    }
    
    SiteTraverser.prototype.process = function(url) {
        
        var self = this,
            persister = this.persister = this.logger.persistentLog('Fetching URL (' + pathname(url) + ')').color('yellow'),
            xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest(),
            checkResponse,
            t = setTimeout(function(){
                if (!complete) {
                    xhr.abort();
                    persister.color('#FF6F00').update( 'TIMEOUT' );
                    self.next();
                }
            }, this.timeout),
            complete = false;
            
        xhr.open( 'GET', url, true );
        
        xhr.onreadystatechange = function() {
            
            var error, headerContentType = xhr.getResponseHeader('Content-Type');
            
            if (xhr.readyState === 4) {
                
                complete = true;
                
                if (headerContentType && !self.contentType.test(headerContentType)) {
                    persister.remove();
                    self.next();
                    return;
                }
                
                if ( xhrSuccess(xhr) && xhr.responseText ) {
                    
                    self.processSource(xhr.responseText);
                    // User-defined check:
                    self.check.call(self, xhr.responseText, pathname(url), xhr);
                    
                } else {
                    self.httpError.call(self, xhr);
                }
                
            }
        };
        
        xhr.send(null);
            
    };
    
    SiteTraverser.prototype.pending = function(msg, more) {
        this.persister
            .color('#00D7FF')
            .update( msg || 'PENDING REQUEST' )
            .more( more );
    };
    
    SiteTraverser.prototype.failure = function(msg, more) {
        this.persister
            .color('#FF6F00')
            .update( msg || 'FAILURE' )
            .more( more );
        this.next();
    };
    
    SiteTraverser.prototype.success = function(msg, more) {
        this.persister
            .color('')
            .update( msg || 'SUCCESS' )
            .more( more );
        this.next();
    };
    
    SiteTraverser.prototype.processSource = function(source) {
        
        if ( !this.crawl ) {
            return;
        }
        
        source = source.replace(/<script(.|\s)*?\/script>/g,'');
        
        var d = document.createElement('div'),
            anchors, len, href, i = -1;
            
        d.innerHTML = source;
        
        anchors = d.getElementsByTagName('a');
        len = anchors.length;
        
        while ( ++i < len ) {
            if ( isInternal(href = anchors[i].href.replace(/^\s+|#.*$/,'')) ) {
                this.urls.push(href);
            }
        }
        
    };
    
    SiteTraverser.prototype.go = function() {
        this.paused = false;
        return this.next();
    };
    
    SiteTraverser.prototype.next = function() {
        
        if ( !this.urls.length || this.paused || this.count >= this.limit ) { return this; }
        
        this.current_url = this.urls.shift();
        
        try{
            if ( this.done[this.current_url] ) {
                this.next();
            } else {
                this.done[this.current_url] = true;
                ++this.count;
                this.process( this.current_url );
            }
        } catch(e) {
            // window.console && console.error && console.error(e);
            this.genericError.call(this, e);
        }
        
        return this;
        
    };
    
    SiteTraverser.prototype.stop = function() {
        var time = new Date;
        this.logger.color('#FF6F00').log('STOPPED ($1)', time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds());
        this.paused = true;
    };
    
    return SiteTraverser;
    
})();


