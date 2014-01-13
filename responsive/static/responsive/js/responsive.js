
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
(function(root, name, make) {
    if (typeof module != 'undefined' && module['exports']) module['exports'] = make();
    else root[name] = make();
}(this, 'verge', function() {

    var xports = {} 
      , win = typeof window != 'undefined' && window
      , doc = typeof document != 'undefined' && document
      , docElem = doc && doc.documentElement
      , Modernizr = win['Modernizr']
      , matchMedia = win['matchMedia'] || win['msMatchMedia']
      , mq = matchMedia ? function(q) {
            return !!matchMedia.call(win, q).matches;
        } : function() {
            return false;
        }
        // http://ryanve.com/lab/dimensions
        // http://github.com/ryanve/verge/issues/7
      , viewportW = docElem['clientWidth'] < win['innerWidth'] ? function() {
            return win['innerWidth'];
        } : function() {
            return docElem['clientWidth'];
        }
      , viewportH = docElem['clientHeight'] < win['innerHeight'] ? function() {
            return win['innerHeight'];
        } : function() {
            return docElem['clientHeight'];
        };
    
    /** 
     * Test if a media query is active. (Fallback uses Modernizr if avail.)
     * @since 1.6.0
     * @return {boolean}
     */    
    xports['mq'] = !matchMedia && Modernizr && Modernizr['mq'] || mq;

    /** 
     * Normalized, gracefully-degrading matchMedia.
     * @since 1.6.0
     * @return {Object}
     */ 
    xports['matchMedia'] = matchMedia ? function() {
        // matchMedia must be binded to window
        return matchMedia.apply(win, arguments);
    } : function() {
        return {};
    };

    /** 
     * Get the layout viewport width.
     * @since 1.0.0
     * @return {number}
     */
    xports['viewportW'] = viewportW;

    /** 
     * Get the layout viewport height.
     * @since 1.0.0
     * @return {number}
     */
    xports['viewportH'] = viewportH;
    
    /**
     * alternate syntax for getting viewport dims
     * @since 1.8.0
     * @return {Object}
     */
    function viewport() {
        return {'width':viewportW(), 'height':viewportH()};
    }
    xports['viewport'] = viewport;
    
    /** 
     * Cross-browser window.scrollX
     * @since 1.0.0
     * @return {number}
     */
    xports['scrollX'] = function() {
        return win.pageXOffset || docElem.scrollLeft; 
    };

    /** 
     * Cross-browser window.scrollY
     * @since 1.0.0
     * @return {number}
     */
    xports['scrollY'] = function() {
        return win.pageYOffset || docElem.scrollTop; 
    };

    /**
     * @param {{top:number, right:number, bottom:number, left:number}} coords
     * @param {number=} cushion adjustment
     * @return {Object}
     */
    function calibrate(coords, cushion) {
        var o = {};
        cushion = +cushion || 0;
        o['width'] = (o['right'] = coords['right'] + cushion) - (o['left'] = coords['left'] - cushion);
        o['height'] = (o['bottom'] = coords['bottom'] + cushion) - (o['top'] = coords['top'] - cushion);
        return o;
    }

    /**
     * Cross-browser element.getBoundingClientRect plus optional cushion.
     * Coords are relative to the top-left corner of the viewport.
     * @since 1.0.0
     * @param {Element|Object} el element or stack (uses first item)
     * @param {number=} cushion +/- pixel adjustment amount
     * @return {Object|boolean}
     */
    function rectangle(el, cushion) {
        el = el && !el.nodeType ? el[0] : el;
        if (!el || 1 !== el.nodeType) return false;
        return calibrate(el.getBoundingClientRect(), cushion);
    }
    xports['rectangle'] = rectangle;

    /**
     * Get the viewport aspect ratio (or the aspect ratio of an object or element)
     * @since 1.7.0
     * @param {(Element|Object)=} o optional object with width/height props or methods
     * @return {number}
     * @link http://w3.org/TR/css3-mediaqueries/#orientation
     */
    function aspect(o) {
        o = null == o ? viewport() : 1 === o.nodeType ? rectangle(o) : o;
        var h = o['height'], w = o['width'];
        h = typeof h == 'function' ? h.call(o) : h;
        w = typeof w == 'function' ? w.call(o) : w;
        return w/h;
    }
    xports['aspect'] = aspect;

    /**
     * Test if an element is in the same x-axis section as the viewport.
     * @since 1.0.0
     * @param {Element|Object} el
     * @param {number=} cushion
     * @return {boolean}
     */
    xports['inX'] = function(el, cushion) {
        var r = rectangle(el, cushion);
        return !!r && r.right >= 0 && r.left <= viewportW();
    };

    /**
     * Test if an element is in the same y-axis section as the viewport.
     * @since 1.0.0
     * @param {Element|Object} el
     * @param {number=} cushion
     * @return {boolean}
     */
    xports['inY'] = function(el, cushion) {
        var r = rectangle(el, cushion);
        return !!r && r.bottom >= 0 && r.top <= viewportH();
    };

    /**
     * Test if an element is in the viewport.
     * @since 1.0.0
     * @param {Element|Object} el
     * @param {number=} cushion
     * @return {boolean}
     */
    xports['inViewport'] = function(el, cushion) {
        // Equiv to `inX(el, cushion) && inY(el, cushion)` but just manually do both 
        // to avoid calling rectangle() twice. It gzips just as small like this.
        var r = rectangle(el, cushion);
        return !!r && r.bottom >= 0 && r.right >= 0 && r.top <= viewportH() && r.left <= viewportW();
    };

    return xports;
}));
(function() {
    var cookieName = 'resolution';
    var i, key, value, prevSet, cookies = document.cookie.split(";");
    function isCookieSet() {
        for (i = 0; i < cookies.length; i++) {
            key = cookies[i].substr(0, cookies[i].indexOf("="));
            value = cookies[i].substr(cookies[i].indexOf("=") + 1);
            key = key.replace(/^\s+|\s+$/g, "");
            if (key == cookieName) return true;
        }
        return false;
    }
    // Check if cookie was previously set
    prevSet = isCookieSet();
    // Set the cookie
    document.cookie = cookieName + '=' + verge.viewportW()+ ':' + verge.viewportH() + '; path=/';
    // Force browser refresh if not previously set
    if (navigator.cookieEnabled && !prevSet) document.location.reload(true);
}(document));


