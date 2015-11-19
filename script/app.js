$(function () {
    init();
});

$("#search").bind('input propertychange', function () {
    var $searchKey = $("#search");
    var phrase = $searchKey.val()
        .replace(/^\s+|\s+$/g, "")
        .replace(/\s+/g, "|");
    if (phrase == "") {
        init();
    } else {
        if (phrase.length < 2) {
            return;
        }
        phrase = ["(", phrase, ")"].join("");
        searchResult(new RegExp(phrase, "gi"));
    }
});

var init = function () {
    $.ajax({
        url: "../json/bookmarks.json",
        type: "get",
        contentType: "text/plain;charset=utf-8",
        dataType: 'json',
        success: function (bookmarks) {
            var convertBookmarks = _.chain(bookmarks)
                .map(function (val, key) {
                    return {title: val.title, created: formatDate(val.created)};
                })
                .sortBy("created")
                .reverse()
                .value();
            var compiled = _.template($("#list").html());
            var html = compiled({"bookmarks": convertBookmarks});
            $(".list").html(html);
        },
        error: function (XMLHttpRequest, textStatus) {
            console.log(textStatus);
        }
    });
}

var searchResult = function (regex) {
    $.ajax({
        url: "../json/bookmarks.json",
        type: "get",
        contentType: "text/plain;charset=utf-8",
        dataType: 'json',
        success: function (bookmarks) {
            var convertBookmarks = _.chain(bookmarks)
                .filter(function (val, key) {
                    return val.title.match(regex);
                })
                .map(function (val, key) {
                    return {title: val.title, created: formatDate(val.created)};
                })
                .sortBy("created")
                .reverse()
                .value();
            var compiled = _.template($("#list").html());
            var html = compiled({"bookmarks": convertBookmarks});
            $(".list").html(html);
            $(".list *").highlight(regex, "highlight");
        },
        error: function (XMLHttpRequest, textStatus) {
            console.log(textStatus);
        }
    });
}

jQuery.fn.highlight = function (regex, className) {
    return this.each(function () {
        $(this).contents()
            .filter(function () {
                return this.nodeType == 3 && regex.test(this.nodeValue);
            })
            .replaceWith(function () {
                return (this.nodeValue || "")
                    .replace(regex, function (match) {
                        return "<span class=\"" + className + "\">" + match + "</span>";
                    });
            });
    });
};

var formatDate = function (date) {
    var time = new Date(parseInt(date) * 1000);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
        month = month > 10 ? month : '0' + month;
    var day = time.getDay();
        day = day > 10 ? day : '0' + day;
    return year + '-' + month + '-' + day;
}
