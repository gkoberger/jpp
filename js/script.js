/* The JS in this is kind of weird, simply because I had to make it work without knowing how the
 * backend would be implemented. I'd be happy to restructure it once we know how things will be
 * done on the actual site */

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

                /* The quad */
                var $quad = $('<div>', {'class': 'tinyquad'});
                var $quad_parent = $('<div>', {'class': 'column unitx1 first'});
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
                $quad_parent.append($quad);
                $p.append($quad_parent);

                /* Icon */
                var $icon = $('<div>', {'class': 'column unitx1'});
                $icon.append($('<img>', {'src': v.Icon, 'class': 'icon'}));
                $p.append($icon);

                /* The details */
                var $text = $('<div>', {'class': 'column unitx4'});
                $text.append($('<h3>', {'text': v.Name}));
                $text.append($('<p>', {'text': v.Description}));
                $p.append($text);

                /* Add it to the page */
                $('#results').append($p);

                /* Re-apply the filters */
                filter();
            });
        });
    });

    $(window).bind('change-achievements', function(e, type) {
        if($('#page-achievements').length) {
            $('.selector.on').removeClass('on');
            var $selector = $(type + '-selector');
            $selector.addClass('on');
            $selector.trigger('change');
        }
    });

    onloader();
});

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

/* Stuff in here will be called on page onload */
function onloader() {
    var $selector = $('.selector.on');
    if($selector.length) {
        $selector.trigger('change');
    }
}
