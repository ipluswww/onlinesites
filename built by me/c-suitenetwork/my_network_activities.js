/**
 * @author infantgeek
 * @since: 1.0
 * @Service - v3/contents
 */
console.log('### My Network Activities widget');
JiveService.GET.activities(function (activities) {
    $('#activityContentBlock').html("");
    var authorYMMemberID = "";
    $.each(activities, function (index, activityObj) {
        var place = activityObj.parentPlace;
        var objectType = activityObj.type;
        var shouldRender = false;
        authorYMMemberID = activityObj.memberID;
        var typeAllowed = (objectType != 'favorite' && objectType != 'dm');

        if(typeAllowed
            && (place.placeID == undefined && place.type == 'person')
            || (place.placeID != undefined && place.type == 'blog' && activityObj.author.resources.blog != undefined && place.uri == activityObj.author.resources.blog.ref)){
            shouldRender = true;
        }
        // Personal Blogs, Space Blogs, Group blogs - place.type == 'blog'
        else if(typeAllowed && place.placeID != undefined && ( place.type == 'space' || place.type == 'blog' ) &&
            // Space > News - 2063, Bloomberg - 8863, Thirstie - 10281
            (place.placeID == 2063 || place.placeID == 8863 || place.placeID == 10281)) {
            //console.log('Allowed space / group ', place.type);
            shouldRender = true;
        }
        shouldRender = (shouldRender && typeAllowed && authorYMMemberID != undefined);
        if(typeAllowed){
            console.log(activityObj, place.type, place.name, shouldRender);
        }
        if(shouldRender){
            var objectID = activityObj.id;
            var comObjectID = objectID;
            var author = activityObj.author;
            //var email = JiveService.Util.getPrimaryEmail(author.emails);
            //if (email != "") {
            if (objectType == "video") {
                objectID = activityObj.contentID;
            }
            var subject = activityObj.subject;
            var summary = activityObj.content.text;

            if (objectType == 'update') {
                subject = "";
            }
            summary = JiveService.Util.getActivityShortDescription(summary);
			var pos1;
			while((pos1 = summary.search('href="<a href=\'')) >= 0)
			{
				pos1 += 6;
				var res1 = summary.slice(pos1);
				var sustr1 = summary.slice(0, pos1);
				var pos2 = res1.search('\'>');
				pos2 += 2;
				var res2 = res1.slice(pos2);
				var pos3 = res2.search('</a>"');
				var sustr2 = res2.slice(0, pos3);
				var sustr3 = res2.slice(pos3+4);
				summary = sustr1 + sustr2 + sustr3;
			}
			console.log(summary);
            // To fix the broken HTML by substring...
            var div = document.createElement('div');
            div.innerHTML = summary;
            summary = div.innerHTML;
			
            var replyCount = activityObj.replyCount;
            var likeCount = activityObj.likeCount;
            if (likeCount == undefined) {
                likeCount = 0;
            }
            if (replyCount == undefined) {
                replyCount = 0;
            }

            var acObjHtml = "<div id='activity_" + objectID + "' class='messagetitle'><div class='row' style='margin-top:0px; margin-bottom:0px;'>";
            acObjHtml += "<div id='commmentdetail_info_" + objectID + "' class='col-md-10 col-xs-10 col-sm-10'><h5>" +
                "<a id='lastcommentuser_" + objectID + "' href='/mpage/UserProfile/?id=" + authorYMMemberID + "' class='mylink'></a> commented on this</h5></div>" +
                "<div class='col-md-2 col-xs-2 col-sm-2'><h5 style='text-align:right;' id='lastcommentduration_" + objectID + "'></h5></div></div>" +
                "<hr id='hr_" + objectID + "' style='margin:0px 0px 5px 0px !important;background:rgb(204, 198, 198) none repeat scroll 0% 0%;'>";
            acObjHtml += "<div class='postbox'><img id='avatar_" + objectID + "' data-src='" + JiveService.GET.avatar(author.thumbnailUrl) + "' class=\"messageimg\">" +
                //acObjHtml += "<div class='postbox'><img id='avatar_"+objectID+"' src='" + JiveService.buildUrl("/jive/image?url=" + author.thumbnailUrl) + "' class=\"messageimg\">" +
                "<a href='/mpage/UserProfile/?id=" + authorYMMemberID + "' class='mylink'>" + author.displayName + "</a><br>";
            if (objectType != 'update') {
                // target='_blank' href='/mpage/TrendingContent/?id="+contentObj.id +"&type="+contentObj.type+ "'
                acObjHtml += "<span><a target='_blank' href='/mpage/TrendingContent/?id=" + objectID + "&type=" + objectType + "'>" + subject + "</a></span>";
            } else {
                acObjHtml += "<span>" + subject + "</span>";
            }
            acObjHtml += "<br><br><h5 style='line-height: 20px;'>" + summary + "</h5>" +
                "<div class='action_blk'>" +
                "<button type='button' class='btn btn-default btn-xs action_btn' onclick='postBlockLike(" + objectID + ",\"" + objectType + "\");'>" +
                "<span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span> Like" +
                "<span class='dot'>.</span><span>" + likeCount + "</span>" +
                "</button>" +
                "<button type='button' class='btn btn-default btn-xs action_btn' onclick='postBlockComment(" + objectID + ",\"" + objectType + "\");'>" +
                "<span class='glyphicon glyphicon-comment' aria-hidden='true'></span> Comment" +
                "<span class='dot'>.</span><span>" + replyCount + "</span>" +
                "</button>" +
                "</div>" +

                "<div id='comments_" + objectID + "'></div></div></div>";
            $('#activityContentBlock').append(acObjHtml);
            if (replyCount > 0) {
                var commentAuthor = "", commentAuthorID = "";
                var lastCommentTime = "";
                var comments = activityObj.activityComments;
                $.each(comments, function (index, relatedActivity) {
                    var relActivityID = relatedActivity.id;
                    var relActivityType = relatedActivity.type;
                    var commentAuthorEmail = relatedActivity.author.email;
                    commentAuthor = relatedActivity.author.name;
                    commentAuthorID = relatedActivity.author.id;
                    var commentAuthorImage = relatedActivity.author.resources.avatar.ref;
                    var modificationTime = relatedActivity.modificationTime;
                    var commentLikeCount = relatedActivity.likeCount;
                    var commentReplyCount = relatedActivity.replyCount;
                    lastCommentTime = modificationTime;
                    var commentBody = relatedActivity.content.text;
                    var commentAuthorYMMemberID = "";
                    if (objectType == 'video') {
                        commentAuthorEmail = JiveService.Util.getPrimaryEmail(relatedActivity.author.emails);
                        commentAuthor = relatedActivity.author.displayName;
                        modificationTime = relatedActivity.modificationTime;
                        lastCommentTime = modificationTime;
                        commentBody = relatedActivity.content.text;
                        commentAuthorYMMemberID = "";
                    }

                    commentAuthorYMMemberID = relatedActivity.memberID;
                    if (commentAuthorYMMemberID == undefined) {
                        commentAuthorYMMemberID = "not_available_ym";
                    }
                    var commentObj = "<div class='previousbox'><div class='row'><div class='col-md-11 col-xs-11 col-sm-11'>" +
                        "<img class='previousboximg' id='avatar_" + relActivityID + "' data-src='" + JiveService.GET.avatar(commentAuthorImage) + "'><div><h5>" +
                        "<a href='/mpage/UserProfile/?id=" + commentAuthorYMMemberID + "'  class='mylink'>" + commentAuthor + "</a> " + commentBody + "</h5>" +
                        "<div class='action_blk'>" +
                        "<button type='button' class='btn btn-default btn-xs action_btn' onclick='postBlockLike(" + relActivityID + ",\"" + relActivityType + "\");'>" +
                        "<span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span> Like" +
                        "<span class='dot'>.</span><span>" + commentLikeCount + "</span>" +
                        "</button>" +
                        "<button type='button' class='btn btn-default btn-xs action_btn' onclick='postBlockComment(" + objectID + ",\"" + objectType + "\");'>" +
                        "<span class='glyphicon glyphicon-comment' aria-hidden='true'></span> Comment" +
                        "<span class='dot'>.</span><span>" + commentReplyCount + "</span>" +
                        "</button>" +
                        "</div>" +
                        "</div></div><div class='col-md-1 col-xs-1 col-sm-1 text-right'></div></div><hr style='background:rgb(204, 198, 198) none repeat scroll 0% 0%; height:1px;'></div>";
                    $('#comments_' + objectID).append(commentObj);
                    if (commentAuthor != "" && lastCommentTime > 0) {
                        $('#commmentdetail_info_' + objectID).show();
                        $('#lastcommentuser_' + objectID).html(commentAuthor);
                        $('#lastcommentduration_' + objectID).html(JiveService.Util.linkishTime(lastCommentTime));
                    } else {
                        $('#commmentdetail_info_' + objectID).hide();
                        $('#hr_' + objectID).hide();
                    }
                });
            }
            // Show the activity details
            else {
                $('#commmentdetail_info_' + objectID).show();
                $('#lastcommentuser_' + objectID).html(author.displayName);
                $('#lastcommentduration_' + objectID).html(JiveService.Util.linkishTime(activityObj.lastActivity));
            }
            //}
        }
    });
    console.log('completed rendering my network activities widget');
    // Update the Image tags with actual images...
    $('#activityContentBlock').find('img').each(function (i, e) {
        var dataSrc = JiveService.Util.searchAndReplace($(e).data('src'), 'v2/users', 'v3/people');
        $(e).attr('data-src', '');
        $(e).attr('src', dataSrc);
    });
});
//  Add a new blank div activityContentBlock as below
//<div class="messagebox">
//   <div id="activityContentBlock"></div>
//</div>