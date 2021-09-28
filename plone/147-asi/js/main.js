MyApp = {};
MyApp.spreadsheetData = [];
MyApp.keywords = [];
MyApp.headerData = [
    { "sTitle": "Title" }, { "sTitle": "Program" }, { "sTitle": "Year" }, { "sTitle": "Type" }, { "sTitle": "region" }, { "sTitle": "organizations" }, { "sTitle": "categories" }
];
MyApp.filterIndexes = { "regions": 5, "categories" : 7 };
MyApp.Organizations = [], MyApp.Regions = [], MyApp.categories = [];

String.prototype.trunc = function (n) {
    return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
};

$(function () {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/1y7A89kMdcA8_uGTky0ec5Qksj4g9cIIpm4veVYrNDb4/values/Sheet1?key=AIzaSyA3dk7j-VOX78HlLFqsOEHNL5rDljrMtIA";
    $.getJSON(url, {}, function (data) {
        // Data is formatted like so. Use the index to get the corresponding data
        // [
        //     "Title",
        //     "Type of Organization ",
        //     "Program",
        //     "Region",
        //     "Link",
        //     "Type",
        //     "Categories",
        //     "Year"
        // ],
        for (let i = 1; i < data["values"].length; i++) {
            const currVal = data["values"][i];
            const name = currVal[0];
            const orgtype = currVal[1];
            const prog = currVal[2];
            const region = currVal[3];
            const link = currVal[4];
            const type = currVal[5];
            const categories = currVal[6];
            const year = currVal[7];
            const title = `<a href='${link}' target=_blank > ${name}</a>`;

            MyApp.spreadsheetData.push(
                [
                    title,
                    prog, 
                    year, 
                    type,
                    orgtype,
                    region, categories
                ]);
    
            if ($.inArray(orgtype, MyApp.Organizations) === -1 && orgtype.length !== 0) {
                MyApp.Organizations.push(orgtype);
            }

            if ($.inArray(region, MyApp.Regions) === -1 && region.length !== 0) {
                MyApp.Regions.push(region);
            }

            //Add the keywords, which are semi-colon separated. First trim them and then replace the CRLF, then split.
            if (categories) {
                $.each(categories.trim().replace(/^[\r\n]+|\.|[\r\n]+$/g, "").split(';'), function (key, val) {
                    val = val.trim(); //need to trim the semi-colon separated values after split
                    
                    if ($.inArray(val, MyApp.categories) === -1 && val.length !== 0) {
                        MyApp.categories.push(val);
                    }
                });
    
            }

            MyApp.categories.sort();
        }

        MyApp.Organizations.sort();
        MyApp.Regions.sort();
        //MyApp.keywords.sort();

        createDataTable();
        addFilters();
    });
})

function hideUnavailableOrganizations(){
    var fileredData = MyApp.oTable._('tr', {"filter":"applied"});

    //Get departments available after the filters are set
    MyApp.Organizations = [];
    $.each(fileredData, function (key, val) {
        var org = val[MyApp.filterIndexes["organizations"]];

        if ($.inArray(org, MyApp.Organizations) === -1 && org.length !== 0) {
                MyApp.Organizations.push(org);
        }
    });
}


function addFilters(){
    var $region = $("#regions");
    
    $.each(MyApp.Regions, function (key, val) {
        $region.append('<li><label><input type="checkbox" name="' + val + '"> ' + val + '</label></li>');
    });


    var $researcharea = $("#researcharea");
    
    $.each(MyApp.categories, function (key, val) {
        $researcharea.append('<li><label><input type="checkbox" name="' + val + '"> ' + val + '</label></li>');
    });


    $(".filterrow").on("click", "ul.filterlist", function (e) {
        var filterRegex = "";
        var filterName = this.id;
        var filterIndex = MyApp.filterIndexes[filterName];

        var filters = [];
        $("input", this).each(function (key, val) {
            if (val.checked) {
                if (filterRegex.length !== 0) {
                    filterRegex += "|";
                }

                filterRegex += val.name; //Use the hat and dollar to require an exact match                
            }
        });

        MyApp.oTable.fnFilter(filterRegex, filterIndex, true, false);
        hideUnavailableOrganizations();
        displayCurrentFilters();
    });

    $("#clearfilters").click(function (e) {
        e.preventDefault();

        $(":checkbox", "ul.filterlist").each(function () {
            this.checked = false;
        });

        $("ul.filterlist").click();
    });
}

function displayCurrentFilters() {
    var $filterAlert = $("#filters");
    var filters = "";

    $("input:checked", "#filterAccordian").each(function () {
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
        "link-content-pre": function (a) {
            return $(a).html().trim().toLowerCase();
        },

        "link-content-asc": function (a, b) {
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        },

        "link-content-desc": function (a, b) {
            return ((a < b) ? 1 : ((a > b) ? -1 : 0));
        }
    });

    MyApp.oTable = $("#spreadsheet").dataTable({
        "aoColumnDefs": [
            //{ "sType": "link-content", "aTargets": [ 0 ] },
            { "bVisible": false, "aTargets": [ -2, -3, -1 ] } //hide the keywords column for now (the last column, hence -1)
        ],
        "iDisplayLength": 20,
        "bLengthChange": false,
        "aaData": MyApp.spreadsheetData,
        "aoColumns": MyApp.headerData
    });
}