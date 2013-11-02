function cmsCommentFetchGet(data) {
    if (data.length != 0) {
        $.ajax({
            url: $("#comments").data('url').'/'.data[0],
            type: "GET",
            dataType: "json",
            timeout: 5000,
            success: function(data, status, xhr) {
                if (!xhr.responseJSON) {
                    data.splice(0, 1);
                    cmsCommentFetchGet(data);
                    return;
                }
                if (!xhr.responseJSON.msg || !xhr.responseJSON.contents || !xhr.responseJSON.comment_id) {
                    data.splice(0, 1);
                    cmsCommentFetchGet(data);
                    return;
                }
                if ($("#comments > div").length == 0) {
                    $("#nocomments").fadeOut(300, function() {
                        $(this).remove();
                        $(xhr.responseJSON.contents).prependTo('#comments').hide().fadeIn(300, function() {
                            cmsTimeAgo("#timeago_comment_"+xhr.responseJSON.comment_id);
                            cmsCommentEdit("#editable_comment_"+xhr.responseJSON.comment_id);
                            cmsCommentDelete("#deletable_comment_"+xhr.responseJSON.comment_id+"_1");
                            cmsCommentDelete("#deletable_comment_"+xhr.responseJSON.comment_id+"_2");
                            data.splice(0, 1);
                            cmsCommentFetchGet(data);
                        });
                    });
                } else {
                    $(xhr.responseJSON.contents).prependTo('#comments').hide().slideDown(300, function() {
                        cmsTimeAgo("#timeago_comment_"+xhr.responseJSON.comment_id);
                        cmsCommentEdit("#editable_comment_"+xhr.responseJSON.comment_id);
                        cmsCommentDelete("#deletable_comment_"+xhr.responseJSON.comment_id+"_1");
                        cmsCommentDelete("#deletable_comment_"+xhr.responseJSON.comment_id+"_2");
                        data.splice(0, 1);
                        cmsCommentFetchGet(data);
                    });
                }
            },
            error: function(xhr, status, error) {
                data.splice(0, 1);
                cmsCommentFetchGet(data);
            }
        });
        return
    }

    cmsCommentLock = false;
    cmsCommentFetch();
    console.log('done processing');
}

function cmsCommentFetchNew(data) {
    var length = data.length;
    var fetch = new Array();

    for (var i = 0; i < length; i++) {
        var ok = false;
        $("#comments > div").each(function() {
            if ($(this).data('pk') == data[i].comment_id) {
                ok = true;
            }
        }

        if (ok == false) {
            fetch.push(data[i]);
        }
    });

    cmsCommentFetchGet(fetch);
}

function cmsCommentFetchProcess(data) {
    // do something with the data
    console.log(data);

    var length = data.length;
    var num = 0;
    var done = 0;

    $("#comments > div").each(function() {
        var ok = false;
        for (var i = 0; i < length; i++) {
            if ($(this).data('pk') == data[i].comment_id) {
                if ($(this).data('ver') == data[i].comment_ver) {
                    ok = true;
                }
            }
        }
        if (ok == false) {
            num++;
            if ($("#comments > div").length == 1) {
                $(this).fadeOut(300, function() {
                    $(this).remove();
                    done++;
                }); 
            } else {
                $(this).slideUp(300, function() {
                    $(this).remove();
                    done++;
                });
            }
        }
    });

    var cmsCommentNewCheck = setInterval(function() {
        if (num === done) {
            clearInterval(cmsCommentNewCheck);
            if ($("#comments > div").length == 1) {
                $("<p id=\"nocomments\">There are currently no comments.</p>").prependTo("#comments").hide().fadeIn(300, function() {
                    cmsCommentFetchNew(data);
                });
            } else {
                cmsCommentFetchNew(data);
            }
        }
    }, 10);
}

function cmsCommentFetchWork() {
    $.ajax({
        url: $("#comments").data('url'),
        type: "GET",
        dataType: "json",
        timeout: 5000,
        success: function(data, status, xhr) {
            if (!xhr.responseJSON) {
                cmsCommentLock = false;
                cmsCommentFetch();
                return;
            }
            cmsCommentFetchProcess(xhr.responseJSON);
        },
        error: function(xhr, status, error) {
            cmsCommentLock = false;
            cmsCommentFetch();
            console.log('processing errored');
        }
    });
}

function cmsCommentFetchWait() {
    var cmsCommentFetchCheck = setInterval(function() {
        if (cmsCommentLock == false) {
            clearInterval(cmsCommentFetchCheck);
            cmsCommentLock = true;
            cmsCommentFetchWork()
        }
    }, 10);
    return false;
}

function cmsCommentFetch() {
    setTimeout(function() {
        cmsCommentFetchWait()
    }, 5000);
}
