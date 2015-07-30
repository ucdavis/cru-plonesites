function GenerateTitleColumn(e){var t=e.gsx$title.$t,a=e.gsx$abstract.$t,n=e.gsx$linkstowhat.$t;return"<a href='"+n+"' class='abstract-popover' data-toggle='popover' data-content='"+a+"' data-original-title='Abstract'>"+t+"</a>"}function abstractPopup(){$("#spreadsheet").popover({selector:".abstract-popover",trigger:"hover"})}function addFilters(){var e=$("#filter_elements");$.each(MyApp.keywords,function(t,a){e.append('<li><label><input type="checkbox" name="'+a+'"> '+a+"</label></li>")}),e.on("change",function(e){e.preventDefault();var t=this.name,a="",n=[];$("input:checkbox",this).each(function(e,t){t.checked&&(0!==a.length&&(a+="|"),a+="(^"+t.name+"$)")}),console.log(a),MyApp.oTable.fnFilter(a,4,!0,!1),displayCurrentFilters()}),$("#clearfilters").click(function(t){t.preventDefault(),$(":checkbox",e).each(function(){this.checked=!1}),e.change()})}function displayCurrentFilters(){var e=$("#filters"),t="";if($(":checked","#filter_elements").each(function(){0!==t.length&&(t+=" + "),t+="<strong>"+this.name+"</strong>"}),0!==t.length){var a=$("<div class='alert alert-info'><strong>Filters</strong><p>You are filtering on "+t+"</p></div>");e.html(a),e[0].scrollIntoView(!0)}else e.html(null)}function createDataTable(){jQuery.extend(jQuery.fn.dataTableExt.oSort,{"link-content-pre":function(e){return $(e).html().trim().toLowerCase()},"link-content-asc":function(e,t){return t>e?-1:e>t?1:0},"link-content-desc":function(e,t){return t>e?1:e>t?-1:0}}),MyApp.oTable=$("#spreadsheet").dataTable({aoColumnDefs:[{sType:"link-content",aTargets:[0]},{bVisible:!1,aTargets:[-1]}],iDisplayLength:20,bLengthChange:!1,aaData:MyApp.spreadsheetData,aoColumns:MyApp.headerData})}MyApp={},MyApp.spreadsheetData=[],MyApp.keywords=[],MyApp.headerData=[{sTitle:"Title"},{sTitle:"Authors"},{sTitle:"Source"},{sTitle:"Year"},{sTitle:"keywords"}],String.prototype.trunc=function(e){return this.substr(0,e-1)+(this.length>e?"&hellip;":"")},$(function(){var e="https://spreadsheets.google.com/feeds/list/1FvN9jIUMulKgVw5PoA8ZpuuxSNaSwmD_xpkOVLSs9XQ/1/public/values?alt=json-in-script&callback=?";$.getJSON(e,{},function(e){$.each(e.feed.entry,function(e,t){var a=t.gsx$title.$t,n=t.gsx$authors.$t,r=t.gsx$source.$t,s=t.gsx$year.$t,l=t.gsx$keywords.$t,o=t.gsx$abstract.$t,i=t.gsx$linkstowhat.$t;MyApp.spreadsheetData.push([GenerateTitleColumn(t),n,r,s,l]),-1===$.inArray(l,MyApp.keywords)&&0!==l.length&&MyApp.keywords.push(l)}),MyApp.keywords.sort(),createDataTable(),addFilters(),abstractPopup()})});