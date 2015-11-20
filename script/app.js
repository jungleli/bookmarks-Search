$(function () {
    var bookmarks = getData();
    updateList(bookmarks);

    $("#search").on('input', function () {
        var phrase = $("#search").val()
            .replace(/^\s+|\s+$/g, "")
            .replace(/\s+/g, "|");
        var regExp = new RegExp((phrase), "gi");
        updateList(bookmarks, regExp);
        $(".list *").highlight(regExp, "highlight");
    });

    function updateList(bookmarks, regex) {
        var compiled = _.template($("#list").html());
        var html = compiled({"bookmarks": filterData(bookmarks, regex)});
        $(".list").html(html);
    }

    function getData() {
        var bookmarks = JSON.parse(localStorage.getItem('bookmark'));
        if (!bookmarks)
            $.get("json/bookmarks.json")
                .done(function (data) {
                    bookmarks = localStorage.setItem('bookmark', JSON.stringify(data));
                });
        return bookmarks;
    }

    function filterData(data, regex) {
        return _.chain(data)
            .filter(function (val, key) {
                return val.title.match(regex);
            })
            .map(function (val, key) {
                return {title: val.title, created: formatDate(val.created)};
            })
            .sortBy("created")
            .reverse()
            .value();
    }
});

function formatDate(date) {
    var time = new Date(parseInt(date) * 1000);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    month = month > 10 ? month : '0' + month;
    var day = time.getDay();
    day = day > 10 ? day : '0' + day;
    return year + '-' + month + '-' + day;
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
