/* The JS in this is kind of weird, simply because I had to make it work without knowing how the
 * backend would be implemented. I'd be happy to restructure it once we know how things will be
 * done on the actual site */

var site = $('body').data('url');

$(function() {
    /* Switch between achievement types on profile pages */
    $(window).on('click', '#my-achievements a', function(e) {
        e.preventDefault();
        var $link = $(this);
        $('#my-achievements-all > div').hide();
        $($link.attr('href')).show();
        $('#my-achievements .on').removeClass('on');
        $link.addClass('on');

        $(window).trigger('change-achievements', [$link.attr('href')]);
    });

    /* Open/close the "Leave" link in the edit profile form */
    $(window).on('click', '.leave', function(e) {
        e.preventDefault();
        if($(this).hasClass('open')) {
            $('#leave-options').slideUp();
            $(this).removeClass('open');
        } else {
            $('#leave-options').slideDown();
            $(this).addClass('open');
        }
    });

    $(window).on('keyup', '#filter', filter);

    $(window).on('change', '.selector', function() {
        var url = $(this).attr('data-url');

        $('#results').addClass('loading');

        /* Figure out query params */
        var data = {};
        var $selector = $('.selector.on');
        var option = $selector.find('[value=' + $selector.val() + ']');
        if(option.data('filter')) {
            data[option.data('filter')] = option.data('value') ? true : false; // Convert 1/0 to true/false
        }

        $.getJSON(url, data, function(d) {
            $('#results .person').remove();
            $('#results').removeClass('loading');
            $.each(d, function(k, v) {
                var $p = $('<div>', {'class': 'person',
                                     'data-text': v.Name});
                $p.append($('<div>', {'class': 'first column unitx1', 'html':'&nbsp;'}));

                var href = site + 'Quest/' + v.ID;

                /* The quad */
                if(v.PointsExplore !== undefined) {
                    href = site + 'Achievement/' + v.ID;

                    $p.addClass('quad');
                    var $quad = $('<div>', {'class': 'tinyquad'});
                    if(v.PointsExplore) {
                        $quad.append($('<div>', {'class': 'quad-explore', 'text': v.PointsExplore}));
                    }
                    if(v.PointsLearn) {
                        $quad.append($('<div>', {'class': 'quad-learn', 'text': v.PointsLearn}));
                    }
                    if(v.PointsMake) {
                        $quad.append($('<div>', {'class': 'quad-make', 'text': v.PointsMake}));
                    }
                    if(v.PointsSocial) {
                        $quad.append($('<div>', {'class': 'quad-social', 'text': v.PointsSocial}));
                    }
                }

                /* Icon */
                var $icon = $('<a>', {'href': href, 'class': 'column unitx1'});
                $icon.append($quad);

                $icon.append($('<img>', {'src': v.Icon, 'class': 'icon'}));
                $p.append($icon);

                /* The details */
                var $text = $('<div>', {'class': 'column unitx4'});
                var $a = $('<a>', {'href': href, 'text': v.Name});
                $text.append($('<h3>').append($a));

                $text.append($('<p>', {'text': v.Description}));

                $p.append($text);

                /* Add it to the page */
                $('#results').append($p);
            });

            /* Re-apply the filters */
            filter();
        });
    });

    $(window).bind('change-achievements', function(e, type) {
        if($('#page-achievements').length) {
            $('.selector.on').removeClass('on');
            var $selector = $(type + '-selector');
            $selector.addClass('on');
            $selector.trigger('change');
        }
        if($('#page-friends').length) {
            updateFriends(type);
        }
    });

    onloader();
});

function updateFriends(type) {
    var url = $('#page-friends').data('url');
    $('#results').addClass('loading');

    var data = {'friend': !!(type == '#my-people-friends')};

    $.getJSON(url, data, function(d) {
        $('#results .person').remove();
        $('#results').removeClass('loading');
        $.each(d, function(k, v) {
            var $p = $('<div>', {'class': 'person', 'data-text': v.DisplayName + '|' + v.FullName});

            /* Add friend button? */
            var $first = $('<div>', {'class': 'first column unitx1', 'html': '&nbsp;'});
            $p.append($first);

            if(!v.Friend) {
                var $a = $('<a>', {'href': '#', 'text': 'Add Friend', 'class': 'addFriend'});
                $a.one('click', function() {
                    alert('This is where the add-friend code goes! Talk to Greg about implementing this :)');
                    $(this).addClass('on');
                });
                $first.empty().append($a);
            }

            var href = site + 'Profile/' + v.ID;
            var $icon = $('<a>', {'href': href, 'class': 'column unitx1'});
            $icon.append($('<img>', {'src': v.Photo, 'class': 'icon'}));
            $p.append($icon);

            var $info = $('<div>', {'class': 'column unitx4'});
            var $a = $('<a>', {'href': href, 'text': v.FullName});
            if(v.DisplayName) {
                var $span = $('<span>', {'text': ' (' + v.DisplayName + ')'});
                $a.append($span);
            }
            $info.append($('<h3>').append($a));
            $info.append($('<p>', {'text': v.SixWordBio}));
            $p.append($info);

            /* Add it to the page */
            $('#results').append($p);
        });

        /* Re-apply the filters */
        filter();
    });
}

function filter() {
    /* This is slow; we need to speed it up. */
    var filter_text = $('#filter').val().toLowerCase();

    var found = false;
    $('#results > .person').each(function() {
        var text = $(this).attr('data-text').toLowerCase();
        var matches = text.indexOf(filter_text) != -1;
        $(this).toggle(matches);
        if(matches) found = true;
    });
    $('#no-results').toggle(!found);
}

function createSlider() {
    var $slider = $('#slider');
    var $wrapper = $slider.find('.wrapper');
    var w = $slider.width();
    var h = $slider.height();
    var left = 0;

    var hide_controls = $slider.hasClass('hide_controls');

    if(!$wrapper) return;

    $wrapper.width(w * $wrapper.children().length);

    $wrapper.children().each(function() {
        $(this).css({'width': w,
                    'height': h,
                    'float': 'left'});
    });

    $slider.bind('next', function() {
        left = left - w;
        if(left * -1 >= $wrapper.width()) {
            left = 0;
        }
        $wrapper.css({'left': left});
        $slider.trigger('change', [Math.abs(left / w)]);
    });

    $slider.bind('goto', function(e, i) {
        left = i * w * -1;
        $wrapper.css({'left': left});
        $slider.trigger('change', [i]);
    });

    $slider.bind('prev', function() {
        left = left + w;
        if(left > 0) {
            left = ($wrapper.children().length - 1) * w * -1;
        }
        $wrapper.css({'left': left});
        $slider.trigger('change', [Math.abs(left / w)]);
    });

    var autoslide = setInterval(function() {
        $slider.trigger('next');
    }, 15000);

    $slider.bind('stop', function() {
            clearInterval(autoslide);
    });

    if(!hide_controls) {
        var $controls = $('<div>', {'class': 'controls'});
        var $left = $('<a>', {'href': '#', 'class': 'jpp rotate small'});
        $controls.append($left);
        $left.click(function(e) {
            e.preventDefault();
            $('#slider').trigger('prev');
            clearInterval(autoslide);
        });

        var i = 0;
        $wrapper.children().each(function() {
            var $a = $('<a>', {'href': '#', 'class': 'pacman-dot'});
            var num = i;
            $controls.append($a);
            $a.click(function(e) {
                e.preventDefault();
                $('#slider').trigger('goto', [num]);
                clearInterval(autoslide);
            });
            i++;
        });

        var $right = $('<a>', {'href': '#', 'class': 'jpp small'});
        $controls.append($right);
        $right.click(function(e) {
            e.preventDefault();
            $('#slider').trigger('next');
            clearInterval(autoslide);
        });

        $slider.after($controls);
    }
}

function showErrors() {
    showPopup('errors');
}

function showSuccess() {
    showPopup('success');
}

function showPopup(type) {
    $('#'+type+'-pop').remove();
    var $pop = $('<div>', {'id': type+'-pop'});
    var pop = $('.'+type+'-pop');
    $pop.append(pop);
    if(pop.length) {
        $pop.show();
    }

    var $close = $('<a>', {'href': '#',
                   'text': 'x', 'class': 'close'});

    $close.click(function(e) {
        e.preventDefault();
        $('#'+type+'-pop').remove();
    });

    $pop.append($close);

    $('body').append($pop);
}

/* Stuff in here will be called on page onload */
function onloader() {
    var $selector = $('.selector.on');
    if($selector.length) {
        $selector.trigger('change');
    }

    if($('#page-friends').length) {
        updateFriends('#my-people-friends');
    }

    if($('#slider').length) {
        createSlider();
    }

    if(!placeholderIsSupported()) {
        $('body').placeholders();
    }

    $tc = $('.tutorial-controls');
    if($tc.length) {
        $tc.find('a').click(function(e) {
            $('#slider').trigger('stop');
            e.preventDefault();
            var num = $(this).data('num');
            $('#slider').trigger('goto', [num]);
        });

        $('#slider').bind('change', function(e, i) {
            $tc.find('.on').removeClass('on');
            $tc.find('a').eq(i).addClass('on');
        });
    }

    showErrors();
    showSuccess();
}
