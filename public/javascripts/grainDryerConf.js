$(function() {
    var baseurl = 'http://q.nqminds.com/v1/datasets/EkbvAb8B4g/data?opts={"limit":35032}';

    var dialog, form,

        gtype = $("#gtype"),
        btime = $("#btime"),
        etime = $("#etime"),
        nbatch = $("#nbatch"),
        gbatch = $("#gbatch"),
        allFields = $([]).add(gtype).add(btime).add(etime).add(nbatch).add(gbatch),
        tips = $(".validateTips");

    function updateTips(t) {
        tips
            .text(t)
            .addClass("ui-state-highlight");
        setTimeout(function() {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function checkLength(o, n, min, max) {
        var otext = o.val().trim();

        if (otext.length > max || otext.length < min) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be between " +
                min + " and " + max + ", iuput as '2015-01-31T16:36:16'.");
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, n) {
        var otext = o.val().trim();
        otext = otext.split('-');

        if (otext.length != 3) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        }

        otext = [otext[0], otext[1]].concat(otext[2].split(':'));

        if (otext.length != 5) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        }

        if ((/^\d{4}$/.test(otext[0])) && (/^\d{1,2}$/.test(otext[1])) && (/^\d{1,2}$/.test(otext[3])) && (/^\d{1,2}$/.test(otext[4]))) {
            otext[2] = otext[2].toUpperCase();
            otext = otext[2].split('T');

            if (otext.length != 2) {
                o.addClass("ui-state-error");
                updateTips(n);
                return false;
            }

            if ((/^\d{1,2}$/.test(otext[0])) && (/^\d{1,2}$/.test(otext[1]))) {
                return true;
            } else {
                o.addClass("ui-state-error");
                updateTips(n);
                return false;
            }
        } else {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        }
    }

    function validCheck() {
        var valid = true;

        allFields.removeClass("ui-state-error");

        if (gtype.val() == "0") {
            gtype.addClass("ui-state-error");
            updateTips("Please choose the Grain Type.");
            return false;
        }

        valid = valid && checkLength(btime, "Begin Time", 14, 19);
        valid = valid && checkLength(etime, "End Time", 14, 19);

        valid = valid && checkRegexp(btime, "Time iuput may like '2015-01-31T16:36:16'.");
        valid = valid && checkRegexp(etime, "Time iuput may like '2015-01-31T16:36:16'.");

        return valid;
    }

    function addUser() {
        var valid = validCheck();

        if (valid) {
            //check batch
            if (nbatch.val() == "") {
                nbatch.addClass("ui-state-error");
                updateTips("Please press 'Get Batch' and then choose the batch.");
                return false;
            }

            var optslength = nbatch.find('option').length;

            for (i = 0; i < optslength; i++) {
                if (i.toString() != nbatch.val().toString()) {
                    nbatch.find('option[value=' + i + ']').attr("selected", false);
                }
            }

            gtype.find('option[value=' + gtype.val() + ']').attr("selected", "selected");
            btime.attr("value", btime.val());
            etime.attr("value", etime.val());
            nbatch.find('option[value=' + nbatch.val() + ']').attr("selected", "selected");

            var reqlist = nbatch.find('option[value=' + nbatch.val() + ']').text();
            reqlist = reqlist.split(': ');

            var batchNum = reqlist[0];

            reqlist = reqlist[1].split('--');

            var startTime = (new Date(reqlist[0])).getTime() / 1000;
            var endTime = (new Date(reqlist[1])).getTime() / 1000;


            var dataFlag = savedData(batchNum, startTime, endTime);
            
            if (dataFlag) {
                savedDataSort(batchNum, startTime, endTime);
            } else {
                var filterurl = 'filter={"Timestamp":{"$gte":' + startTime + ',' + '"$lte":' + endTime + '}}';
                var gdurl = baseurl + '&' + filterurl;

                d3.json(gdurl, function(error, batchData) {
                    if (error) {
                        alert(error);
                        console.warn(error);

                        return 0;
                    }
                    
                    reqBatchData(batchData.data, batchNum, startTime, endTime);
                });
            }

            dialog.dialog("close");

        }

        return valid;
    }

    dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 420,
        width: 300,
        modal: true,
        buttons: {
            "Submit": addUser,
            "Cancel": function() {
                gtype.find('option[value=' + gtype.val() + ']').attr("selected", "selected");
                btime.attr("value", btime.val());
                etime.attr("value", etime.val());

                dialog.dialog("close");
            },
            "Cancel&Reconfig": reConfig
        },
        close: function() {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function(event) {
        event.preventDefault();
        addUser();
    });

    $("#gdconfig").button().on("click", function() {
        dialog.dialog("open");
    });

    gbatch.button().on("click", function() {
        var i;

        var optslength = nbatch.find('option').length;

        for (i = 1; i < optslength; i++) {
            nbatch.find('option[value=' + i + ']').remove();

        }

        var valid = validCheck();

        if (valid) {
            var reqinf = {
                "grainType": gtype.val(),
                "startTime": Math.floor(getTimestamp(btime.val()) / 1000),
                "endTime": Math.floor(getTimestamp(etime.val()) / 1000)
            };

            if (reqinf.grainType != "wheat") {
                alert("no " + reqinf.grainType + " data");

                return 0;
            }

            var filterurl = 'filter={"Timestamp":{"$gte":' + reqinf.startTime + ',' + '"$lte":' + reqinf.endTime + '}}';
            var gdurl = baseurl + '&' + filterurl;

            $("#batchtext").text("  waiting---");

            d3.json(gdurl, function(error, dataTotal) {
                if (error) {
                    alert(error);
                    console.warn(error);
                    $("#batchtext").text("");

                    return 0;
                }

                if (dataTotal.data.length == 0) {
                    alert("no data in given time period");
                    $("#batchtext").text("");

                    return 0;
                }

                var batchList = getBatchList(dataTotal.data);

                var i, bTime, eTime;

                gtype.attr("disabled", "disabled");
                btime.attr("disabled", "disabled");
                etime.attr("disabled", "disabled");
                gbatch.attr("disabled", "disabled");

                $("#batchtext").text("");

                nbatch.find('option[value="0"]').remove();

                nbatch.append('<option value="0">select---</option>').val('');

                for (i = 0; i < batchList.length; i++) {
                    bTime = new Date(batchList[i].stime * 1000).toString();
                    bTime = bTime.slice(0, bTime.indexOf("GMT") - 1);

                    var eTime = new Date(batchList[i].etime * 1000).toString();
                    eTime = eTime.slice(0, eTime.indexOf("GMT") - 1);

                    nbatch.append($('<option>', {
                        value: batchList[i].num,
                        text: batchList[i].num + ": " + bTime + "--" + eTime
                    }));
                }
            });
        }
    });

    function reConfig() {
        batchDataTotal = [];

        var i;

        var optslength = nbatch.find('option').length;

        for (i = 0; i < optslength; i++) {
            nbatch.find('option[value=' + i + ']').remove();

        }

        nbatch.append('<option value="0">Press "Get Batch" and then choose the batch, after finishing above fields</option>').val('');

        gtype.attr("disabled", false);
        btime.attr("disabled", false);
        etime.attr("disabled", false);
        gbatch.attr("disabled", false);

        gtype.find('option[value=' + gtype.val() + ']').attr("selected", false);
        gtype.find('option[value="0"]').attr("selected", "selected");
        btime.attr("value", btime.val());
        etime.attr("value", etime.val());

        dialog.dialog("close");

        return true;
    }
});
