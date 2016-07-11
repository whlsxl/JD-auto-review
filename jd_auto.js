// ==UserScript==
// @name        JD_Auto
// @namespace   http://club.jd.com/
// @description JD products auto review
// @include     http://club.jd.com/*
// @version     0.1
// @run-at document-end
// @copyright  2016+, Hailong <whlsxl@126.com>
// ==/UserScript==
function jda_wrapper() {

var JDA = {};
JDA.default_cmts = [
"特别棒，京东棒棒哒～～～",
"好评！必须好评！汪汪汪",
"这次狗东为朕服务的不错，喵"
];

JDA.init = function() {
  var ns = JDA.cmtsSelectNodeString()
  $(".thumbnail-list").append(ns)
  JDA.startAll();
  $(".f-textarea").find('textarea').each(function(index, el) {
    JDA.setCmt(this);
  });
  $("#installVoucher").bind('DOMNodeInserted', function(e) {
    JDA.startAll(e.target);
  });
  $("#activityVoucher").bind('DOMNodeInserted', function(e) {
    JDA.startAll(e.target);
  });
};
// from parent node
// star 1-5
JDA.startAll = function(from = "body", star = 5, force = false) {
  if (isNaN(star)) { star = 5; }
  if (star > 5) { star = 5; }
  if (star < 0) { star = 0; }
  var starClass = "star" + star;
  $(from).find(".commstar").each(function(index, el) {
    if ( force || $(this).find(".active").length == 0 ) {
      $(this).find("." + starClass).addClass("active");
      $(this).find('.star-info').text(star + "\u5206").addClass("highlight");
    }
  });
};

JDA.getConfig = function(key) {
  if (window.localStorage) {
    return window.localStorage.getItem(key) || "";
  } else {
    return getCookie(key);
  }
};

JDA.setConfig = function(key, value) {
  if (window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    setGdCookie(key, value, 86400*365);
  }
};

JDA.getCmts = function() {
  var cmts = jQuery.parseJSON(JDA.getConfig("JDA_default_cmts"))
  if (cmts == null) {
    return JDA.default_cmts;
  }
  return cmts
};

JDA.cmtsSelectNodeString = function() {
  var nodeString = "<div><select class='jda_auto_cmt'>";
  $.each(JDA.getCmts(), function(index, value) {
    nodeString += "<option>" + value + "</option>";
  });
  nodeString += "</select></div>";
  return nodeString;
};

JDA.setCmt = function(textarea, text = null) {
  if (text == null) {
    var ns = JDA.getCmts()
    text = ns[Math.floor(Math.random() * ns.length)]
  }
  $(textarea).text(text)
};



JDA.init();

}; // jda_wrapper

$().ready(function() {
  var script = document.createElement('script');
  script.appendChild(document.createTextNode('('+ jda_wrapper +')();'));
  (document.body || document.head || document.documentElement).appendChild(script);
})