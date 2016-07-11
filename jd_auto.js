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
"这次狗东为朕服务的不错，喵～"
];

JDA.shuffle = function(length) {
  var arr = [];
  while (length--) arr[length] = length;
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor(i * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled;
};

JDA.init = function() {
  var ns = JDA.cmtsSelectNodeString();
  $('.thumbnail-list').append(ns);
  JDA.startAll('body', JDA.getDefaultStar());
  $('.f-textarea').find('textarea').each(function(index, el) {
    JDA.setCmt(this);
  });
  $('#activityVoucher').bind('DOMNodeInserted', function(e) {
    JDA.startAll(e.target, JDA.getDefaultStar());
  });
  $('.f-goods .fi-operate').bind('DOMNodeInserted', function(e) {
    JDA.setTags(e.target);
  });
  JDA.addMenuBar()
};

// from parent node
// star 1-5
JDA.startAll = function(from = 'body', star = 5, force = false) {
  if (isNaN(star)) { star = 5; }
  if (star > 5) { star = 5; }
  if (star < 0) { star = 0; }
  var starClass = "star" + star;
  $(from).find(".commstar").each(function(index, el) {
    if ( force || $(this).find(".active").length == 0 ) {
      $(this).find(".active").removeClass('active')
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

// from the m-tagbox parent or m-tagbox node
// type 0 is random 1 is ordered
// count is selected count
JDA.setTags = function(from = "body", type = 0, count = 3) {
  if (count > 5) { count = 5; }
  var block = function(target) {
    var tagbox = $(target);
    tagbox.find(".tag-item").removeClass("tag-checked");
    if (type == 0) {
      var length = tagbox.find('.tag-item').length;
      var randomArr = JDA.shuffle(length);
      var randomSlice = randomArr.slice(0, Math.min(count, length));
      $.each(randomSlice, function(index, value) {
        tagbox.find('.tag-item:eq(' + value + ')').toggleClass("tag-checked");
      });
    } else {
      tagbox.find('.tag-item:lt(' + count + ')').toggleClass("tag-checked");
    }
  };

  if ($(from).hasClass('.m-tagbox')) {
    $(from).each(function() {
      block(this);
    });
  } else {
    $(from).find('.m-tagbox').each(function() {
      block(this);
    });
  }
};

JDA.getDefaultStar = function() {
  var defaultStar = JDA.getConfig('JDA_default_star');
  if (defaultStar == '') {
    return 5
  }
  return parseInt(JDA.getConfig('JDA_default_star'));
}

JDA.setDefaultStar = function(star) {
  return JDA.setConfig('JDA_default_star', star);
}

JDA.addMenuBar = function() {
  $('.f-btnbox').append('<div class="menu-bar-star" style="float:right;"><div style="float:left;">全部评分：</div><br><span class="commstar z-star-checked"><span class="star star1"><i class="face"></i></span><span class="star star2"><i class="face"></i></span><span class="star star3"><i class="face"></i></span><span class="star star4"><i class="face"></i></span><span class="star star5"><i class="face"></i></span><span class="star-info">0分</span></span></div>');
  JDA.startAll($('.f-btnbox'), JDA.getDefaultStar());
  $('.f-btnbox').find('.star').click(function(event) {
    var star = parseInt($(this).siblings('.star-info').text());
    JDA.startAll('body', star, true);
    JDA.setDefaultStar(star);
  });
}

JDA.init();

}; // jda_wrapper

$().ready(function() {
  var script = document.createElement('script');
  script.appendChild(document.createTextNode('('+ jda_wrapper +')();'));
  (document.body || document.head || document.documentElement).appendChild(script);
})