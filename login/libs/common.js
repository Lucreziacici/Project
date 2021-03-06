
// ----------------- 兼容 ----------------------
!(function(){
  var _div = document.createElement('div');
  var support = {};
  function getVendorPropertyName(prop) {
    if (prop in _div.style) return prop;

    var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
    var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

    for (var i=0; i<prefixes.length; ++i) {
      var vendorProp = prefixes[i] + prop_;
      if (vendorProp in _div.style) { return vendorProp; }
    }
  }
  support.transition      = getVendorPropertyName('transition');
  support.transitionDelay = getVendorPropertyName('transitionDelay');
  support.transform       = getVendorPropertyName('transform');
  support.transformOrigin = getVendorPropertyName('transformOrigin');
  support.animation       = getVendorPropertyName('animation');
  support.animationDelay  = getVendorPropertyName('animationDelay');
  support.fullScreen      = getVendorPropertyName('requestFullscreen');

  var transEndEventNames = {
    'transition':       'transitionend',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd',  
  };
  support.transitionEnd = transEndEventNames[support.transition] || null;

  var animEndEventNames = {
    animation:          'animationend',
    MozAnimation:       'animationend',
    OAnimation:         'oAnimationEnd oanimationend',
    WebkitAnimation:    'webkitAnimationEnd',
    msAnimation:        'MSAnimationEnd',
  };
  support.animationEnd = animEndEventNames[support.animation] || null;

  for (var key in support) {
    $ ? ($.support[key] = support[key]) : null;
  }

  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  // 获取当前秒数时间
  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  // 兼容 location.origin，获取完整 host
  if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  }

  // 获取此元素现在已有的样式
  if (!HTMLElement.currentStyle) {
    function _getStyle(prop) {
      var _s = window.getComputedStyle(this, null)
      return prop ? _s[prop] : _s;
    }
    HTMLElement.prototype.currentStyle = _getStyle;
    HTMLElement.prototype.getStyle = _getStyle;
  }
})();

// ----------------- 判断的拓展 ----------------------
!(function(){
  // 判断类型
  function Type(obj) {
    var typeStr = Object.prototype.toString.call(obj).split(" ")[1];
    return typeStr.substr(0, typeStr.length - 1).toLowerCase();
  }

  // 判断对象是否为空
  function isEmpty(obj) {
    for (var i in obj) return false;
    return true;
  }

  // 对比两个对象是否相等
  function ObjectEqual(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
 
    if (aProps.length != bProps.length) return false;

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  }
})();

// ----------------- 获取 ----------------------
!(function(){
  // 截取 search 中数值
  function GetQueryString(name, str, end) {
    var str = str || window.location.search;
    var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(&|$' + (end ? ("|" + end) : "") + ')');
    var r = str.match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
  }
  window.GetQueryString = GetQueryString;

  // 区间内的随机数
  function Random(min, max) {
    return (min||0) + Math.random() * ((max||1) - (min||0));
  }
  window.Random = Random;

  // 自动补零
  function addZero(num, n) {
    var len = num.toString().length, n = n || 2;
    while (len < n) {
      num = '0' + num; len++;
    }
    return num + '';
  }
  window.addZero = addZero;

  // 生成唯一标识
  function guid(len) {
    return Math.random().toString(36).substring(2, (len||5)+2);
  }
  window.guid = guid;

  // 日期加减
  function DateAddDay(date, days) {
    var d = new Date(date);
    return new Date(d.setDate(d.getDate() + days));
  }
  window.DateAddDay = DateAddDay;
})();

// ----------------- jquery 拓展 ----------------------
!(function(){
  // 判断某 jquery 元素是否存在
  $.fn.exist = function(){
    return this.length > 0;
  }

  // 按钮禁用与激活
  $.fn.disable = function () {
    return this.each(function () {
      $(this).addClass('disabled').attr('tabindex', -1);
    });
  }
  $.fn.enable = function () {
    return this.each(function () {
      $(this).removeClass('disabled').removeAttr('tabindex');
    });
  }

  function AnimEnd(type, className, callback, stay) {
    if (Type(callback) === 'boolean') {stay = callback; callback = null;}
    return this.each(function() {
      var $this = $(this);
      $this.removeClass('hide').addClass(className);
      type ? $this.one($.support.transitionEnd, _end) : $this.one($.support.animationEnd, _end);
    });
    function _end() {
      var Timer = setTimeout(function(){
        clearTimeout(Timer);
        if (!stay) $this.removeClass(className);
        if (callback) callback.apply($this);
      }, 300);
    }
  }
  $.fn.addAnim = function(className, callback, stay) {
    AnimEnd.call(this, 0, className, callback, stay)
  }
  $.fn.addTrans = function(className, callback, stay) {
    AnimEnd.call(this, 1, className, callback, stay)
  }
})();

// ----------------- jquery 拓展2 ----------------------
!(function(){
  // 按键拓展
  $('body').on('click.default', '[href="#"]', function(e){
    e.preventDefault(); return false;
  });
})();

// ----------------- 其他封装 ----------------------
// 常用方法
!(function(){
  // 图片预加载
  function preloadImage(imgArr, fn, callback) {
    var count = 0, len = typeof imgArr=='number' ? imgArr : imgArr.length;
    for(var i=0; i<len; i++) {
      var img = new Image();
      img.onload = function() {
        fn && fn(++count/len*100);
        if (count >= len) callback && callback();
      };
      img.src = imgArr[i];
    }
  }
  window.preloadImage = preloadImage;
})()

// 微信转发
!(function(){
  if (typeof wx == 'undefined') {
    console.error('请调用 <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>');
  }

  function WxReady(callback, plugins) {
    if (/micromessenger/i.test(navigator.userAgent)) {
      callback && callback(); return;
    }
    $.ajaxSetup({ async: false });
    $.getJSON('http://sum.kdcer.com/api/applet/WeixinConfig', {
      Url: window.location.href
    }, function(r){
      plugins && r.concat(plugins);
      if (typeof wx == 'undefined') return;
      wx.config(r);
      callback && callback();
      wx.ready(function () {
        callback && callback();
      });
    }).fail(function(err){
      alert('wxconfig 获取失败');
      console.log(err);
    });
    $.ajaxSetup({ async: true });
  }
  window.WxReady = WxReady;

  function WxShare(json) {
    var data = $.extend({
      title: '',
      link: '',
      imgUrl: '',
      desc: '',
      success: function(){},
      cancel: function(){},
    }, json || {});

    console.log('转发信息', data);
    wx.onMenuShareTimeline(data);
    wx.onMenuShareAppMessage(data);
  }
  window.WxShare = WxShare;

  function WxChat(json, before) {
    WxReady(function(){
      before && before();
      WxShare(json);
    });
  }
  window.WxChat = WxChat;
})()


// 前端路由  ---------
!(function(){
  function Router() {
    this.routes = {};
    $(window).on('load.search hashchange.search popstate.search', this.resolve.bind(this))
  }
  Router.prototype.route = function(path, callback) {
    this.routes[path] = callback || function(){};
  }
  Router.prototype.resolve = function (e) {
    this.curHash = location.hash.slice(1) || '/';
    typeof this.routes[this.curHash] === 'function' && this.routes[this.curHash]();
  }
  window.router = new Router();
})();

// 数据存储  ---------
!(function(){
  function Storage(item, isSession) {
    var db = isSession ? sessionStorage : localStorage;

    function JsonParse(response) {
      try {
        return JSON.parse(response);
      } catch(e) {
        return response;
      }
    }

    return {
      get: function(name) {
        if (typeof name === 'boolean' && name) return db;
        var _item = name || item;
        return JsonParse(db.getItem(_item));
      },
      remove: function(name){
        if (typeof name === 'boolean' && name) {
          db.clear(); return db;
        }
        var _item = name || item;
        db.removeItem(_item);
        return db;
      },
      set: function(name, val) {
        if (name != item) {
          if (typeof val !== 'undefined')  {
            db.setItem(name, JSON.strigify(val));
            return db;
          }
        }
        db.setItem(item, JSON.strigify(name));
        return db;
      },
      clear: function() {
        db.clear();
      },
    }
  }
})();

!(function(){
  var na = navigator.userAgent.toLowerCase()
  window.app = {
    isIOS: !!na.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    isWX: !!na.match(/MicroMessenger/i),
  }
})()