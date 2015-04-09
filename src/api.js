function expand(item, instant) {
  var ul = item.parent().next('ul');

  item.addClass('fa-caret-down')
    .removeClass('fa-caret-right');

  if (instant) {
    ul.show();
    return $.when(true);
  }

  var promises = [ul.slideDown('fast').promise()]

  $('#toc .fa-caret-down').each(function () {
    if (!$(this).is(item)) promises.push(collapse($(this)));
  });

  return $.when.apply($, promises);
}


function collapse(item) {
  return item.removeClass('fa-caret-down')
    .addClass('fa-caret-right')
    .parent().next().slideUp('fast')
    .promise();
}


function mark_active(target) {
  $('#toc li').removeClass('active');
  target.addClass('active');
}


function expand_current(instant) {
  var target = $('#toc a[href="' + window.location.hash + '"]');
  if (target.length) {
    mark_active(target.parent());

    var li = target.parent().parent().parent('li');
    if (li.length) target = li;

    expand(target.find('.fa:first-of-type'), instant).done(function () {
      $('#toc').scrollTop(target.get(0).offsetTop);
    })
  }
}


var hash_offsets = [];
function update_hash() {
  var last;
  var offset = window.pageYOffset + window.innerHeight / 8;

  for (var i = 0; i < hash_offsets.length; i++) {
    if (offset < hash_offsets[i].top) {
      if (typeof last != 'undefined' &&
          window.location.hash != ('#' + last)) {
        var scroll = $('html, body').scrollTop();
        window.location.hash = last;
        $('html, body').scrollTop(scroll);
        expand_current();
      }

      break;
    }

    last = hash_offsets[i].id;
  }
}


$(function() {
  // Table of Contents
  $('<span>')
    .addClass('fa fa-caret-right')
    .click(function (e) {
      var expanded = $(this).hasClass('fa-caret-down');

      if (expanded) collapse($(this));
      else expand($(this));

      e.preventDefault();
      e.stopPropagation();
    })
    .prependTo('#toc > ul > li > a');

  $('#toc > ul > li > a').click(function () {
    expand($(this).find('span'));
    mark_active($(this).next().children('li:first'));
  });

  $('#toc > ul > li > ul > li > a').click(function () {
    mark_active($(this).parent());
  })

  // Expand current hashtag
  expand_current(true);

  // Scrolling
  $('#content h1, #content h2').each(function() {
    hash_offsets.push({
      top: $(this).offset().top,
      id: $(this).attr('id')
    });
  });
  hash_offsets.push({top: 0, id: ''}); // Sentinel

  var timer_id;
  $(document).bind('scroll', function() {
    if (timer_id != 'undefined') clearTimeout(timer_id);
    timer_id = setTimeout(update_hash, 250);
  });

  // Links
  $('#content a').click(function () {
    setTimeout(expand_current, 250);
  });
})
