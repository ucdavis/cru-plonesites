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
    var url = "https://spreadsheets.google.com/feeds/list/1y7A89kMdcA8_uGTky0ec5Qksj4g9cIIpm4veVYrNDb4/1/public/values?alt=json-in-script&callback=?";
    $.get('/js/159421234_5am93l8o_config.json').done(data => {
        getAccessToken(data).then(response => {
            accessToken = response.access_token;
            $.ajax({url: 'https://api.box.com/2.0/folders/64630771665/items', 
            headers: {
                'Authorization': "Bearer " + accessToken.toString()
            }
            }).then(response => {
            let entries = response.entries;
            var promises = [];
            for(file of entries) {
                let request = $.ajax({url: `https://api.box.com/2.0/files/${file.id}/metadata`, 
                headers: {
                    'Authorization': "Bearer " + accessToken.toString()
                }
                }).then(response => {
                    let val = response.entries[0];
                    var title = val.title;
                    var prog = val.program;
                    var year = val.year;
                    var type = val.type;

                    var orgtype = val.organization;

                    var website = "<a target='_blank' href='" + val.link + "'></a>";
                    var region = val.region;
                    var categories = val.categories;

                    // var allResearchInfo = val.gsx$gsx:positiontitle.$t + '<br />' + val.gsx$telephone.$t + '<br />' + val.gsx$categories.$t;
                    
                    MyApp.spreadsheetData.push(
                        [
                            GenerateTitleColumn(val), 
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

                    /*
                    if ($.inArray(keyword, MyApp.keywords) === -1 && keyword.length !== 0) {
                        MyApp.keywords.push(keyword);
                    }
                    */

                    /* DOH */
                    //Add the keywords, which are semi-colon separated. First trim them and then replace the CRLF, then split.
                    $.each(categories.trim().replace(/^[\r\n]+|\.|[\r\n]+$/g, "").split(';'), function (key, val) {
                        val = val.trim(); //need to trim the semi-colon separated values after split
                        
                        if ($.inArray(val, MyApp.categories) === -1 && val.length !== 0) {
                            MyApp.categories.push(val);
                        }
                    });

                    MyApp.categories.sort();
                }, error => console.error(error));
                promises.push(request);
            }
            Promise.all(promises).then(function(){
                MyApp.Organizations.sort();
                MyApp.Regions.sort();
                //MyApp.keywords.sort();
    
                createDataTable();
                addFilters();
            });
                }, error => console.error(error));
            }, error => console.error(error));
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

    // $(":checkbox", "#organizations").each(function () {
    //     //if a checkbox isn't in the list of available departments, hide it
    //     if ($.inArray(this.name, MyApp.Organizations) === -1) {
    //         $(this).parent().css("display", "none");
    //     } else {
    //         $(this).parent().css("display", "block");
    //     }
    // });
}


function addFilters(){
    // var $organizations = $("#organizations");
    
    // $.each(MyApp.Organizations, function (key, val) {
    //     $organizations.append('<li><label><input type="checkbox" name="' + val + '"> ' + val + '</label></li>');
    // });


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

function GenerateTitleColumn(val /* entry value from spreadsheet */){
    var name = val.title;
    // var title = val.gsx$positiontitle.$t;
    var website = val.link;
    //var website = "<a target='_blank' href='" + val.gsx$website.$t + "'>" + val.gsx$website.$t + "</a>";
    //var email = "<a href='mailto:" + val["gsx$e-mail"].$t + "'>" + val["gsx$e-mail"].$t + "</a>";
    // var allResearchInfo = "Research areas: " + val.gsx$categories.$t;
    // var allResearchInfo = val.gsx$categories.$t;

    // var content = allResearchInfo; //could expand content later
    var title = 
    "<a href='"+ website +"' target=_blank >" + 
    name
     + "</a>"
     ;
        
    return title;
}



function displayCurrentFilters() {
    var $filterAlert = $("#filters");
    //var regionFilter = $("#regions"); // Wrong selector..?
    
    var filters = "";

    /*
    if (regionFilter){
        filters += "<strong>" + this.name + "</strong>";
    }
    */

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