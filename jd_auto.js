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
  JDA.setCmtsSelect();
  JDA.startAll('body', JDA.getDefaultStar());
  JDA.setAllCmtTextarea();
  $('#activityVoucher').bind('DOMNodeInserted', function(e) {
    JDA.startAll(e.target, JDA.getDefaultStar());
  });
  $('.f-goods .fi-operate').bind('DOMNodeInserted', function(e) {
    JDA.setTags(e.target);
  });
  JDA.addMenuBar();
  JDA.addChangeCmtBar();
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
  var cmts = jQuery.parseJSON(JDA.getConfig('JDA_default_cmts'))
  if (cmts == null) {
    return JDA.default_cmts;
  }
  return cmts
};

JDA.setCmts = function(cmts) {
  JDA.setConfig('JDA_default_cmts', JSON.stringify(cmts))
};

JDA.getDefaultStar = function() {
  var defaultStar = JDA.getConfig('JDA_default_star');
  if (defaultStar == '') {
    return 5
  }
  return parseInt(defaultStar);
}

JDA.setDefaultStar = function(star) {
  return JDA.setConfig('JDA_default_star', star);
}

JDA.getTagsType = function() {
  var type = JDA.getConfig("JDA_tags_type");
  if (type == "") {
    return 'random';
  }
  return type
}

JDA.setTagsType = function(type) {
  JDA.setConfig("JDA_tags_type", type);
}

JDA.getTagsCount = function() {
  var defaultCount = JDA.getConfig('JDA_tags_count');
  if (defaultCount == '') {
    return 3
  }
  return parseInt(defaultCount);
}

JDA.setTagsCount = function(count) {
  return JDA.setConfig('JDA_tags_count', count);
}

JDA.getCmtsType = function() {
  var type = JDA.getConfig("JDA_cmts_type");
  if (type == "") {
    return 'random';
  }
  return type
}

JDA.setCmtsType = function(type) {
  JDA.setConfig("JDA_cmts_type", type);
}

JDA.getOrderCmt = function() {
  var defaultOrder = JDA.getConfig('JDA_order_cmt');
  var defaultOrderInt = parseInt(defaultOrder);
  if (defaultOrder == '' || JDA.getCmts()[defaultOrderInt] == null) {
    return 0
  }
  return defaultOrderInt;
}

JDA.setOrderCmt = function(order) {
  return JDA.setConfig('JDA_order_cmt', order);
}

JDA.setCmtTextarea = function(textarea, text = null) {
  if (text == null) {
    var ns = JDA.getCmts()
    text = ns[Math.floor(Math.random() * ns.length)]
  }
  $(textarea).text(text)
};

JDA.setAllCmtTextarea = function() {
  var type = JDA.getCmtsType();
  var order = JDA.getOrderCmt();
  var cmts = JDA.getCmts();
  $('.f-textarea').find('textarea').each(function(index, el) {
    if (type == 'random') {
      JDA.setCmtTextarea(this);
    } else {
      JDA.setCmtTextarea(this, cmts[order]);
    }
  });
}

JDA.cmtsSelectNodeString = function(wrapper = true) {
  var nodeString = ''
  if (wrapper) {
    nodeString = '<div class="jda_auto_cmt_div" style="padding-left: 30px; padding-top: 18px; float: left; ">';
  }
  nodeString += '<select class="jda_auto_cmt">';
  $.each(JDA.getCmts(), function(index, value) {
    nodeString += '<option data-order="' + index + '">' + value + '</option>';
  });
  nodeString += '</select>';
  if (wrapper) {
    nodeString += '</div>';
  }
  return nodeString;
};

JDA.setCmtsSelect = function() {
  $('.jda_auto_cmt_div').remove()
  var ns = JDA.cmtsSelectNodeString();
  $('.thumbnail-list').append(ns);
}

// from the m-tagbox parent or m-tagbox node
// type 0 is random 1 is ordered
// count is selected count
JDA.setTags = function(from = "body", type = null, count = -1) {
  if (count > 5 || count < 0) { count = JDA.getTagsCount() }
  if (type == null) {type = JDA.getTagsType()}
  var block = function(target) {
    var tagbox = $(target);
    tagbox.find(".tag-item").removeClass("tag-checked");
    if (type == 'random') {
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

JDA.addMenuBar = function() {
  // stars
  $('.f-btnbox').append('<div class="jda_options_wrapper" style="float:right; margin-top: 4px;"></div>')
  var appendNode = '.jda_options_wrapper';
  $(appendNode).append('<div class="jda-menu-bar-star" style="float:right; margin-top: 4px; padding-left: 30px; "><div style="float:left; font-size:15px">全部评分：</div><br><span class="commstar z-star-checked"><span class="star star1"><i class="face"></i></span><span class="star star2"><i class="face"></i></span><span class="star star3"><i class="face"></i></span><span class="star star4"><i class="face"></i></span><span class="star star5"><i class="face"></i></span><span class="star-info">0分</span></span></div>');
  JDA.startAll($(appendNode), JDA.getDefaultStar());
  $('.jda-menu-bar-star').find('.star').click(function(event) {
    var star = parseInt($(this).siblings('.star-info').text());
    JDA.startAll('body', star, true);
    JDA.setDefaultStar(star);
  });
  // tags type
  $(appendNode).append('<div class="dd jda-tag-options jda-options" style="float:right; margin-top: 9px; "><span style="float:left; padding-right:10px; font-size:15px; padding-top:2px;">标签选项:</span><div class="item" data-type="random"><a href="#none">随机标签</a></div> <div class="item" data-type="ordered"><a href="#none">顺序标签</a></div></div>');
  $('.jda-tag-options a').click(function(e) {
    var nowItem = e.target.closest('.item');
    JDA.setTagsType($(nowItem).data('type'));
    $(nowItem).addClass('selected');
    $(nowItem).siblings('.item').removeClass('selected');
    JDA.setTags()
  });
  $('.jda-tag-options .item[data-type=' + JDA.getTagsType() + ']').addClass('selected');
  // tags count
  var node = '<div style="float: left; padding-top:2px;" ><select class="jda-auto-tags-count">';
  for (var i = 0; i < 5; i++) {
    node += '<option value="' + (i+1) + '">' + (i + 1) + '条</option>';
  }
  node += '</select></div>';
  $('.jda-tag-options').append(node);
  $('.jda-auto-tags-count option:eq(' + (JDA.getTagsCount()-1) + ')').attr('selected', 'selected');
  $('.jda-auto-tags-count').change(function(e) {
    JDA.setTagsCount(parseInt($(e.target).find(':selected').attr('value')));
    JDA.setTags()
  });
  // cmts
  $(appendNode).append('<div class="dd jda-cmts-options jda-options" style="float:right; margin-top: 9px; margin-right: 9px; "><span style="float:left; padding-right:10px; font-size:15px; padding-top:2px;">评论选项:</span><div class="item" data-type="random"><a href="#none">随机评论</a></div> <div class="item" data-type="ordered"><a href="#none">选定评论</a></div></div>');
  $(appendNode).append('<style type="text/css">' +
    '.jda-options .item {margin: 2px 8px 2px 0; float: left;}' +
    '.jda-options .item a {padding:6px 8px; border:1px solid #ccc;  background: #fff; font-size: 13px;}' +
    '.jda-options .item.selected a {border: 2px solid #e4393c; padding: 4px 6px;}' +
    '</style>');
  $('.jda-cmts-options a').click(function(e) {
    var nowItem = e.target.closest('.item');
    JDA.setCmtsType($(nowItem).data('type'));
    $(nowItem).addClass('selected');
    $(nowItem).siblings('.item').removeClass('selected');
    JDA.setAllCmtTextarea()
  });
  $('.jda-cmts-options .item[data-type=' + JDA.getCmtsType() + ']').addClass('selected');
  $('.jda-cmts-options').append(JDA.cmtsSelectNodeString(false));
  $('.jda-cmts-options select').change(function(e) {
    JDA.setOrderCmt(parseInt($(e.target).find(':selected').data('order')));
    if (JDA.getCmtsType == 'ordered') {}
    JDA.setAllCmtTextarea()
  });
}

JDA.addChangeCmtBar = function() {
  var nodeString = '<div class="jda-change-cmt-bar">';
  var cmts = JDA.getCmts();
  if (cmts.length == 0) {
    cmts = [''];
  }
  $.each(cmts, function(index, value) {
    nodeString += ('<div class="cmt-item">' +
    '<input type="text" value="' + value + '">' +
    '<a href class="cmt-delete">删除</a>' +
    '<a href class="cmt-add">增加</a>' +
    '</div>');
  });
  nodeString += ('<div class="cmt-functions" style="width: 100%; text-align: center; padding-top: 20px;">' +
    '<a href class="cmt-reset">重置</a>' +
    '<a href class="cmt-refresh">刷新所有评论</a>' +
    '</div>');
  nodeString += '</div>'
  $('.mycomment-form').append(nodeString);
  $('.mycomment-form').append('<style id="jda-change-cmt-bar-css" type="text/css">' +
    '.cmt-item {width: 100%; text-align: center; padding-top: 20px;}' +
    '.jda-change-cmt-bar input {width:500px; height: 20px; padding: 3px;}' +
    '.jda-change-cmt-bar a {width: 100px; height: 25px; line-height:25px; margin-top:3px; margin-left:10px; background-color: #696969; border-radius: 3px; display: inline-block; font-size: 15px; color: #fff;}' +
    '.jda-change-cmt-bar a.cmt-add {background-color: #df3033;}' +
    '.jda-change-cmt-bar a.cmt-reset {background-color: #5cb85c;}' +
    '.jda-change-cmt-bar a.cmt-refresh {background-color: #337ab7;}' +
    '</style>');
  $('.jda-change-cmt-bar .cmt-delete').live('click', function(e) {
    e.preventDefault();
    if ($('.jda-change-cmt-bar input').length == 1) {
      return;
    }
    $(e.target).closest('.cmt-item').remove();
    var cmts = []
    $('.jda-change-cmt-bar input').each(function(index, el) {
      cmts[index] = $(el).val();
    });
    JDA.setCmts(cmts);
    JDA.setCmtsSelect();
  });
  $('.jda-change-cmt-bar .cmt-add').live('click', function(e) {
    e.preventDefault();
    var nodeString = ('<div class="cmt-item">' +
    '<input type="text">' +
    '<a href class="cmt-delete">删除</a>' +
    '<a href class="cmt-add">增加</a>' +
    '</div>');
    $(nodeString).insertAfter($(e.target).closest('.cmt-item'));
  });

  $('.jda-change-cmt-bar input').live('change', function(e) {
    var cmts = []
    $('.jda-change-cmt-bar input').each(function(index, el) {
      cmts[index] = $(el).val();
    });
    JDA.setCmts(cmts);
    JDA.setCmtsSelect();
  });

  $('.jda-change-cmt-bar .cmt-reset').live('click', function(e) {
    e.preventDefault();
    JDA.setCmts(JDA.default_cmts);
    $('.jda-change-cmt-bar').remove();
    $('#jda-change-cmt-bar-css').remove();
    JDA.addChangeCmtBar();
    JDA.setCmtsSelect();
  });

  $('.jda-change-cmt-bar .cmt-refresh').live('click', function(e) {
    e.preventDefault();
    JDA.setCmtsSelect();
    JDA.setAllCmtTextarea();
  });
}

JDA.init();

}; // jda_wrapper

$().ready(function() {
  var script = document.createElement('script');
  script.appendChild(document.createTextNode('('+ jda_wrapper +')();'));
  (document.body || document.head || document.documentElement).appendChild(script);
})