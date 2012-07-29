$(function() {
    /* Switch between achievement types on profile pages */
    $(window).on('click', '#my-achievements a', function(e) {
        e.preventDefault();
        var $link = $(this);
        $('#my-achievements-all > div').hide();
        $($link.attr('href')).show();
        $('#my-achievements .on').removeClass('on');
        $link.addClass('on');
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
});
