function gacsweb(){
  var $wnd_0 = window, $doc_0 = document, $stats = $wnd_0.__gwtStatsEvent?function(a){
    return $wnd_0.__gwtStatsEvent(a);
  }
  :null, $sessionId_0 = $wnd_0.__gwtStatsSessionId?$wnd_0.__gwtStatsSessionId:null, scriptsDone, loadDone, bodyDone, base = '', metaProps = {}, values = [], providers = [], answers = [], softPermutationId = 0, onLoadErrorFunc, propertyErrorFunc;
  $stats && $stats({moduleName:'gacsweb', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'begin'});
  if (!$wnd_0.__gwt_stylesLoaded) {
    $wnd_0.__gwt_stylesLoaded = {};
  }
  if (!$wnd_0.__gwt_scriptsLoaded) {
    $wnd_0.__gwt_scriptsLoaded = {};
  }
  function isHostedMode(){
    var result = false;
    try {
      var query = $wnd_0.location.search;
      return (query.indexOf('gwt.codesvr=') != -1 || (query.indexOf('gwt.hosted=') != -1 || $wnd_0.external && $wnd_0.external.gwtOnLoad)) && query.indexOf('gwt.hybrid') == -1;
    }
     catch (e) {
    }
    isHostedMode = function(){
      return result;
    }
    ;
    return result;
  }

  function maybeStartModule(){
    if (scriptsDone && loadDone) {
      var iframe = $doc_0.getElementById('gacsweb');
      var frameWnd = iframe.contentWindow;
      if (isHostedMode()) {
        frameWnd.__gwt_getProperty = function(name_0){
          return computePropValue(name_0);
        }
        ;
      }
      gacsweb = null;
      frameWnd.gwtOnLoad(onLoadErrorFunc, 'gacsweb', base, softPermutationId);
      $stats && $stats({moduleName:'gacsweb', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'end'});
    }
  }

  function computeScriptBase(){
    function getDirectoryOfFile(path){
      var hashIndex = path.lastIndexOf('#');
      if (hashIndex == -1) {
        hashIndex = path.length;
      }
      var queryIndex = path.indexOf('?');
      if (queryIndex == -1) {
        queryIndex = path.length;
      }
      var slashIndex = path.lastIndexOf('/', Math.min(queryIndex, hashIndex));
      return slashIndex >= 0?path.substring(0, slashIndex + 1):'';
    }

    function ensureAbsoluteUrl(url_0){
      if (url_0.match(/^\w+:\/\//)) {
      }
       else {
        var img = $doc_0.createElement('img');
        img.src = url_0 + 'clear.cache.gif';
        url_0 = getDirectoryOfFile(img.src);
      }
      return url_0;
    }

    function tryMetaTag(){
      var metaVal = __gwt_getMetaProperty('baseUrl');
      if (metaVal != null) {
        return metaVal;
      }
      return '';
    }

    function tryNocacheJsTag(){
      var scriptTags = $doc_0.getElementsByTagName('script');
      for (var i_0 = 0; i_0 < scriptTags.length; ++i_0) {
        if (scriptTags[i_0].src.indexOf('gacsweb.nocache.js') != -1) {
          return getDirectoryOfFile(scriptTags[i_0].src);
        }
      }
      return '';
    }

    function tryMarkerScript(){
      var thisScript;
      if (typeof isBodyLoaded == 'undefined' || !isBodyLoaded()) {
        var markerId = '__gwt_marker_gacsweb';
        var markerScript;
        $doc_0.write('<script id="' + markerId + '"><\/script>');
        markerScript = $doc_0.getElementById(markerId);
        thisScript = markerScript && markerScript.previousSibling;
        while (thisScript && thisScript.tagName != 'SCRIPT') {
          thisScript = thisScript.previousSibling;
        }
        if (markerScript) {
          markerScript.parentNode.removeChild(markerScript);
        }
        if (thisScript && thisScript.src) {
          return getDirectoryOfFile(thisScript.src);
        }
      }
      return '';
    }

    function tryBaseTag(){
      var baseElements = $doc_0.getElementsByTagName('base');
      if (baseElements.length > 0) {
        return baseElements[baseElements.length - 1].href;
      }
      return '';
    }

    function isLocationOk(){
      var loc = $doc_0.location;
      return loc.href == loc.protocol + '//' + loc.host + loc.pathname + loc.search + loc.hash;
    }

    var tempBase = tryMetaTag();
    if (tempBase == '') {
      tempBase = tryNocacheJsTag();
    }
    if (tempBase == '') {
      tempBase = tryMarkerScript();
    }
    if (tempBase == '') {
      tempBase = tryBaseTag();
    }
    if (tempBase == '' && isLocationOk()) {
      tempBase = getDirectoryOfFile($doc_0.location.href);
    }
    tempBase = ensureAbsoluteUrl(tempBase);
    base = tempBase;
    return tempBase;
  }

  function processMetas(){
    var metas = document.getElementsByTagName('meta');
    for (var i_0 = 0, n = metas.length; i_0 < n; ++i_0) {
      var meta = metas[i_0], name_0 = meta.getAttribute('name'), content_0;
      if (name_0) {
        name_0 = name_0.replace('gacsweb::', '');
        if (name_0.indexOf('::') >= 0) {
          continue;
        }
        if (name_0 == 'gwt:property') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            var value_0, eq = content_0.indexOf('=');
            if (eq >= 0) {
              name_0 = content_0.substring(0, eq);
              value_0 = content_0.substring(eq + 1);
            }
             else {
              name_0 = content_0;
              value_0 = '';
            }
            metaProps[name_0] = value_0;
          }
        }
         else if (name_0 == 'gwt:onPropertyErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              propertyErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onPropertyErrorFn"');
            }
          }
        }
         else if (name_0 == 'gwt:onLoadErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              onLoadErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onLoadErrorFn"');
            }
          }
        }
      }
    }
  }

  function __gwt_isKnownPropertyValue(propName, propValue){
    return propValue in values[propName];
  }

  function __gwt_getMetaProperty(name_0){
    var value_0 = metaProps[name_0];
    return value_0 == null?null:value_0;
  }

  function unflattenKeylistIntoAnswers(propValArray, value_0){
    var answer = answers;
    for (var i_0 = 0, n = propValArray.length - 1; i_0 < n; ++i_0) {
      answer = answer[propValArray[i_0]] || (answer[propValArray[i_0]] = []);
    }
    answer[propValArray[n]] = value_0;
  }

  function computePropValue(propName){
    var value_0 = providers[propName](), allowedValuesMap = values[propName];
    if (value_0 in allowedValuesMap) {
      return value_0;
    }
    var allowedValuesList = [];
    for (var k in allowedValuesMap) {
      allowedValuesList[allowedValuesMap[k]] = k;
    }
    if (propertyErrorFunc) {
      propertyErrorFunc(propName, allowedValuesList, value_0);
    }
    throw null;
  }

  var frameInjected;
  function maybeInjectFrame(){
    if (!frameInjected) {
      frameInjected = true;
      var iframe = $doc_0.createElement('iframe');
      iframe.src = "javascript:''";
      iframe.id = 'gacsweb';
      iframe.style.cssText = 'position:absolute;width:0;height:0;border:none';
      iframe.tabIndex = -1;
      $doc_0.body.appendChild(iframe);
      $stats && $stats({moduleName:'gacsweb', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'moduleRequested'});
      iframe.contentWindow.location.replace(base + initialHtml);
    }
  }

  providers['log_level'] = function(){
    var log_level;
    if (log_level == null) {
      var regex = new RegExp('[\\?&]log_level=([^&#]*)');
      var results = regex.exec(location.search);
      if (results != null) {
        log_level = results[1];
      }
    }
    if (log_level == null) {
      log_level = __gwt_getMetaProperty('log_level');
    }
    if (!__gwt_isKnownPropertyValue('log_level', log_level)) {
      var levels = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF'];
      var possibleLevel = null;
      var foundRequestedLevel = false;
      for (i in levels) {
        foundRequestedLevel |= log_level == levels[i];
        if (__gwt_isKnownPropertyValue('log_level', levels[i])) {
          possibleLevel = levels[i];
        }
        if (i == levels.length - 1 || foundRequestedLevel && possibleLevel != null) {
          log_level = possibleLevel;
          break;
        }
      }
    }
    return log_level;
  }
  ;
  values['log_level'] = {DEBUG:0, OFF:1};
  providers['user.agent'] = function(){
    var ua = navigator.userAgent.toLowerCase();
    var makeVersion = function(result){
      return parseInt(result[1]) * 1000 + parseInt(result[2]);
    }
    ;
    if (function(){
      return ua.indexOf('webkit') != -1;
    }
    ())
      return 'safari';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 10;
    }
    ())
      return 'ie10';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 9;
    }
    ())
      return 'ie9';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 8;
    }
    ())
      return 'ie8';
    if (function(){
      return ua.indexOf('gecko') != -1;
    }
    ())
      return 'gecko1_8';
    return 'unknown';
  }
  ;
  values['user.agent'] = {gecko1_8:0, ie10:1, ie8:2, ie9:3, safari:4};
  gacsweb.onScriptLoad = function(){
    if (frameInjected) {
      loadDone = true;
      maybeStartModule();
    }
  }
  ;
  gacsweb.onInjectionDone = function(){
    scriptsDone = true;
    $stats && $stats({moduleName:'gacsweb', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'loadExternalRefs', millis:(new Date).getTime(), type:'end'});
    maybeStartModule();
  }
  ;
  processMetas();
  computeScriptBase();
  var strongName;
  var initialHtml;
  if (isHostedMode()) {
    if ($wnd_0.external && ($wnd_0.external.initModule && $wnd_0.external.initModule('gacsweb'))) {
      $wnd_0.location.reload();
      return;
    }
    initialHtml = 'hosted.html?gacsweb';
    strongName = '';
  }
  $stats && $stats({moduleName:'gacsweb', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'selectingPermutation'});
  if (!isHostedMode()) {
    try {
      unflattenKeylistIntoAnswers(['OFF', 'safari'], '0F70DC2BD4EB821E728E8C64FF422441');
      unflattenKeylistIntoAnswers(['DEBUG', 'gecko1_8'], '3F733671D1602752CCE3A25FD05C74E2');
      unflattenKeylistIntoAnswers(['DEBUG', 'safari'], '640EE1B655D756BDCE2BAD48687C5508');
      unflattenKeylistIntoAnswers(['OFF', 'gecko1_8'], '9B61B362296B8E7DA6F34888CFBDED6B');
      unflattenKeylistIntoAnswers(['OFF', 'ie9'], '9E13408BE8648C4C5EE4AA9AE1A542F1');
      unflattenKeylistIntoAnswers(['DEBUG', 'ie9'], 'DCF0025A5F10AA06D0609CF99C44EA8F');
      strongName = answers[computePropValue('log_level')][computePropValue('user.agent')];
      var idx = strongName.indexOf(':');
      if (idx != -1) {
        softPermutationId = Number(strongName.substring(idx + 1));
        strongName = strongName.substring(0, idx);
      }
      initialHtml = strongName + '.cache.html';
    }
     catch (e) {
      return;
    }
  }
  var onBodyDoneTimerId;
  function onBodyDone(){
    if (!bodyDone) {
      bodyDone = true;
      if (!__gwt_stylesLoaded['gwt/gacs/gacs.css']) {
        var l = $doc_0.createElement('link');
        __gwt_stylesLoaded['gwt/gacs/gacs.css'] = l;
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('href', base + 'gwt/gacs/gacs.css');
        $doc_0.getElementsByTagName('head')[0].appendChild(l);
      }
      if (!__gwt_stylesLoaded['genius/adql_syntax/codemirror.css']) {
        var l = $doc_0.createElement('link');
        __gwt_stylesLoaded['genius/adql_syntax/codemirror.css'] = l;
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('href', base + 'genius/adql_syntax/codemirror.css');
        $doc_0.getElementsByTagName('head')[0].appendChild(l);
      }
      if (!__gwt_stylesLoaded['genius/adql_syntax/adql.css']) {
        var l = $doc_0.createElement('link');
        __gwt_stylesLoaded['genius/adql_syntax/adql.css'] = l;
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('href', base + 'genius/adql_syntax/adql.css');
        $doc_0.getElementsByTagName('head')[0].appendChild(l);
      }
      if (!__gwt_stylesLoaded['genius/adql_syntax/simple-hint.css']) {
        var l = $doc_0.createElement('link');
        __gwt_stylesLoaded['genius/adql_syntax/simple-hint.css'] = l;
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('href', base + 'genius/adql_syntax/simple-hint.css');
        $doc_0.getElementsByTagName('head')[0].appendChild(l);
      }
      if (!__gwt_stylesLoaded['gwt/esdc/esdc.css']) {
        var l = $doc_0.createElement('link');
        __gwt_stylesLoaded['gwt/esdc/esdc.css'] = l;
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('href', base + 'gwt/esdc/esdc.css');
        $doc_0.getElementsByTagName('head')[0].appendChild(l);
      }
      maybeStartModule();
      if ($doc_0.removeEventListener) {
        $doc_0.removeEventListener('DOMContentLoaded', onBodyDone, false);
      }
      if (onBodyDoneTimerId) {
        clearInterval(onBodyDoneTimerId);
      }
    }
  }

  if ($doc_0.addEventListener) {
    $doc_0.addEventListener('DOMContentLoaded', function(){
      maybeInjectFrame();
      onBodyDone();
    }
    , false);
  }
  var onBodyDoneTimerId = setInterval(function(){
    if (/loaded|complete/.test($doc_0.readyState)) {
      maybeInjectFrame();
      onBodyDone();
    }
  }
  , 50);
  $stats && $stats({moduleName:'gacsweb', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'end'});
  $stats && $stats({moduleName:'gacsweb', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'loadExternalRefs', millis:(new Date).getTime(), type:'begin'});
  if (!__gwt_scriptsLoaded['samp-2.js']) {
    __gwt_scriptsLoaded['samp-2.js'] = true;
    document.write('<script language="javascript" src="' + base + 'samp-2.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['json2.js']) {
    __gwt_scriptsLoaded['json2.js'] = true;
    document.write('<script language="javascript" src="' + base + 'json2.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['flXHR.js']) {
    __gwt_scriptsLoaded['flXHR.js'] = true;
    document.write('<script language="javascript" src="' + base + 'flXHR.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['flensed.js']) {
    __gwt_scriptsLoaded['flensed.js'] = true;
    document.write('<script language="javascript" src="' + base + 'flensed.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['checkplayer.js']) {
    __gwt_scriptsLoaded['checkplayer.js'] = true;
    document.write('<script language="javascript" src="' + base + 'checkplayer.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['swfobject.js']) {
    __gwt_scriptsLoaded['swfobject.js'] = true;
    document.write('<script language="javascript" src="' + base + 'swfobject.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['gacs-samp.js']) {
    __gwt_scriptsLoaded['gacs-samp.js'] = true;
    document.write('<script language="javascript" src="' + base + 'gacs-samp.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['genius/adql_syntax/codemirror.js']) {
    __gwt_scriptsLoaded['genius/adql_syntax/codemirror.js'] = true;
    document.write('<script language="javascript" src="' + base + 'genius/adql_syntax/codemirror.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['genius/adql_syntax/adql.js']) {
    __gwt_scriptsLoaded['genius/adql_syntax/adql.js'] = true;
    document.write('<script language="javascript" src="' + base + 'genius/adql_syntax/adql.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['genius/adql_syntax/simple-hint.js']) {
    __gwt_scriptsLoaded['genius/adql_syntax/simple-hint.js'] = true;
    document.write('<script language="javascript" src="' + base + 'genius/adql_syntax/simple-hint.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['genius/adql_syntax/tap-autocomplete.js']) {
    __gwt_scriptsLoaded['genius/adql_syntax/tap-autocomplete.js'] = true;
    document.write('<script language="javascript" src="' + base + 'genius/adql_syntax/tap-autocomplete.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['genius/adql_syntax/tap-hint.js']) {
    __gwt_scriptsLoaded['genius/adql_syntax/tap-hint.js'] = true;
    document.write('<script language="javascript" src="' + base + 'genius/adql_syntax/tap-hint.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['jquery/jquery-1.9.1.min.js']) {
    __gwt_scriptsLoaded['jquery/jquery-1.9.1.min.js'] = true;
    document.write('<script language="javascript" src="' + base + 'jquery/jquery-1.9.1.min.js"><\/script>');
  }
  $doc_0.write('<script defer="defer">gacsweb.onInjectionDone(\'gacsweb\')<\/script>');
}

gacsweb();
