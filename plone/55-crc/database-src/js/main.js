MyApp = {};
MyApp.spreadsheetData = [];
MyApp.keywords = [];
MyApp.headerData = [
    { "sTitle": "Title" }, { "sTitle": "Authors" }, { "sTitle": "Region" }, { "sTitle": "Year" }, { "sTitle": "Initiative" }, { "sTitle": "keywords" }
];

String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
};

$(function() {
    var url = "https://spreadsheets.google.com/feeds/list/1OXdczccEM7FQ8He-NHtbpV9VBZ0g47ire-dv76yU6WA/1/public/values?alt=json-in-script&callback=?";
    $.getJSON(url, {}, function(data) {
        $.each(data.feed.entry, function(key, val) {
            var title = val.gsx$title.$t;
            var authors = val.gsx$authors.$t;
            var region = val.gsx$region.$t;
            var year = val.gsx$year.$t;
            var initiative = val.gsx$initiative.$t;
            var keyword = val.gsx$keywords.$t;
            var link = val.gsx$linkstowhat.$t;

            MyApp.spreadsheetData.push(
                [
                    GenerateTitleColumn(val), authors, region, year, initiative, keyword
                ]);

            /* DOH */
            //Add the keywords, which are semi-colon separated. First trim them and then replace the CRLF, then split.
            $.each(keyword.trim().replace(/^[\r\n]+|\.|[\r\n]+$/g, "").split(';'), function(key, val) {
                val = val.trim(); //need to trim the semi-colon separated values after split

                if ($.inArray(val, MyApp.keywords) === -1 && val.length !== 0) {
                    MyApp.keywords.push(val);
                }
            });
        });



        MyApp.keywords.sort();

        createDataTable();
        addFilters();
    });
})

function GenerateTitleColumn(entry) { //entry value from spreadsheet
    var title = entry.gsx$title.$t;
    var link = entry.gsx$linkstowhat.$t;


    return "<a href='" + link + "'>" + title + "</a>";
}


function addFilters() {
    var $filter = $("#filter_elements");

    $.each(MyApp.keywords, function(key, val) {
        $filter.append('<li><label><input type="checkbox" name="' + val + '"> ' + val + '</label></li>');
    });

    $(".filterrow").on("click", "ul.filterlist", function (e) {

        var filterRegex = "";
        var filterName = this.id;
        var filterIndex = 5;

        var filters = [];
        $("input", this).each(function (key, val) {
            if (val.checked) {
                if (filterRegex.length !== 0) {
                    filterRegex += "|";
                }

                filterRegex += val.name; //Use the hat and dollar to require an exact match                
            }
        });

        console.log(filterRegex);
        MyApp.oTable.fnFilter(filterRegex, 5, true, false);
        displayCurrentFilters();
    });

    $("#clearfilters").click(function(e) {
        e.preventDefault();

        $(":checkbox", $filter).each(function() {
            this.checked = false;
        });

        $filter.change();
    });
}

function displayCurrentFilters() {
    var $filterAlert = $("#filters");

    var filters = "";

    $(":checked", "#filter_elements").each(function() {
        if (filters.length !== 0) {
            filters += " + "
        }
        filters += "<strong>" + this.name + "</strong>";
    });

    if (filters.length !== 0) {
        var alert = $("<div class='alert alert-info'><strong>Filters</strong><p>You are filtering on " + filters + "</p></div>")

        $filterAlert.html(alert);
        $filterAlert[0].scrollIntoView(true);
    } else {
        $filterAlert.html(null);
    }
}

function createDataTable() {
    //Create a sorter that uses case-insensitive html content
    jQuery.extend(jQuery.fn.dataTableExt.oSort, {
        "link-content-pre": function(a) {
            return $(a).html().trim().toLowerCase();
        },

        "link-content-asc": function(a, b) {
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        },

        "link-content-desc": function(a, b) {
            return ((a < b) ? 1 : ((a > b) ? -1 : 0));
        }
    });

    MyApp.oTable = $("#spreadsheet").dataTable({
        "aoColumnDefs": [
            { "sType": "link-content", "aTargets": [0] },
            { "bVisible": false, "aTargets": [-1] } //hide the keywords column for now (the last column, hence -1)
        ],
        "iDisplayLength": 20,
        "bLengthChange": false,
        "aaData": MyApp.spreadsheetData,
        "aoColumns": MyApp.headerData
    });
}
