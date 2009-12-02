SiteTraverser
===

&copy; [James Padolsey](http://james.padolsey.com)

*SiteTraverser* is a development toolkit you can use to build site crawlers with bookmarklets, or other automated means of running scripts on arbitrary websites (e.g. GreaseMonkey).

First, a preview:

Preview:
---

![prettyPrint.js preview](http://img171.imageshack.us/img171/1593/scr1259769806.png)

Features:
---

* No dependencies.
* Will keep crawling till the cows come home.
* Quite configurable.

Usage:
---

Download sitetraverser.js. You can include it in your document and use it like that, or, to include in a bookmarklet or GreaseMonkey script you'll want to load it dynamically like so:

    var loc = 'http://localhost/projects/SiteTraverser/sitetraverser.js',
        s = document.createElement('script'),
        t = setInterval(function(){
            
            if ( window.SiteTraverser ) {
                
                // Script is loaded
                
                clearInterval(t);
                s.parentNode.removeChild(s);
                
                // Do your stuff here!
                // E.g.
                
                new SiteTraverser({check:function(){/*...*/}}).go();
                
            }
            
        }, 100);
        
    s.src = loc;
    document.body.appendChild(s);

The SiteTraverser is instantiated like so, with a required "options" object passed as its first and only parameter.

    new SiteTraverser({
        /* Options object */
    });
    
There's only one required option, named "check":

    new SiteTraverser({
        check: function(source, url, xhrObject){
            // your stuff
        }
    });
    
The "check" function will be called for every URL, and **you should provide feedback** to the SiteTraverser within your function. Feedback can be given in three forms:

    new SiteTraverser({
        check: function(source, url, xhrObject){
        
            // Success, you've found what you were looking for or
            // all of the checks you performed were successful:
            this.success("Test passed!", "Extra info");
            
            // Something bad happened. Your test wasn't successful,
            // or you didn't find what you were looking for:
            this.failure("Test failed!", "Extra info");
            
            // If you're still waiting for a result, just call this.
            // It's especially useful when you need to make an async
            // request to another service to ascertain the success of
            // the test. (E.g. HTML validation API - JSONP)
            this.pending("Still working - please wait");
            
        }
    });
    
Any "extra info" passed will be accessible through an expandable/collapsible box on each result.

Three things are passed to the "check" function, the source of the current page, the URL, and the corresponding XHR object from the Ajax request.

Other options you can pass to the constructor include:

    new SiteTraverser({
    
        // We've already talked about this one:
        check: function(source, url, xhrObject){...}, 
        
        // Set a limit, how many URLs should be
        // crawled before stopping (default: 1000)?
        limit: 20,
        
        // A regex that specifies what content-types
        // are acceptable. This is the default:
        contentType: /^text\/html/,
        
        // Timeout, - how long should SiteTraverser wait (ms)
        // for each URL before giving up? (default: 20000)
        timeout: 5000,
        
        // If an HTTP error occurs, for example an
        // unresolved URL, what do you want to do?
        // E.g. call this.failure("Oh No! Can't get the page");
        httpError: function(xhrObject) {...},
        
        // A generic error, this will rarely occur,
        // Normally it's a result of some wacky browser
        // bug that can't be prevented. A simply failure
        // assertion should suffice: this.failure("...");
        genericError: function(errorObject) {...},
        
        // Wanna disable crawling and instead specify
        // your own list of URLs?
        // Then you'll want these two:
        crawl: false,
        urls: [ /* Your list of URLs */ ]
        
    });
    
Once you have prepared the SiteTraverser options sufficiently, simply call the go() method on the resulting instance to get going. E.g.

    var myTraverser = new SiteTraverser({...});
    myTraverser.go();
    
Other available methods include:

    myTraverser.stop(); // Stop crawling - you can
                        // restart afterwards by call go()
                        
    myTraverser.next(); // Crawl to the next URL in the queue
    
That's about it! There are some other things you can do, so feel free to explore the API :)
    
An example:
---

Counting the number of elements on 10 pages within your site:

    new SiteTraverser({
        limit: 10, 
        check: function(source, url){
            
            var dom = document.createElement('div'),
                tags = {
                    p: 'paragraph',
                    div: 'div',
                    a: 'anchor',
                    img: 'image'
                },
                result = [],
                total;
            
            dom.innerHTML = source;
            
            total = dom.getElementsByTagName('*').length;
            
            for (var i in tags) {
                result.push(
                    tags[i] + ': ' + dom.getElementsByTagName(i).length
                )
            }
            
            this.success(total + ' elements found!', 'URL: ' + url + '\n' + result.join('\n'));
            
        }
    }).go();

