var libxmljs = require("libxmljs");
var libCCDAGen = require("../lib/templating_functions.js");
var bbm = require("blue-button-meta");
var sec_entries_codes = bbm.CCDA.sections_entries_codes["codes"];

module.exports = function (data, codeSystems, isCCD, CCDxml) {
    var doc = new libxmljs.Document();
    var xmlDoc = libCCDAGen.header_v2(!isCCD ? doc : CCDxml, "2.16.840.1.113883.10.20.22.2.17",
        undefined, sec_entries_codes["SocialHistorySection"], "SOCIAL HISTORY", isCCD);

    // entries loop
    for (var i = 0; i < data.length; i++) {
        var smoking = data[i]["value"] ? data[i]["value"].indexOf("smoke") > -1 : undefined;

        var e = xmlDoc.node('entry').attr({
            typeCode: "DRIV"
        });
        var ob = e.node('observation').attr({
            classCode: "OBS",
            moodCode: "EVN"
        });
        var tId = smoking ? "2.16.840.1.113883.10.20.22.4.78" : "2.16.840.1.113883.10.20.22.4.38";
        ob.node('templateId').attr({
            root: tId
        });
        libCCDAGen.id(ob, data[i].identifiers);
        if (smoking) {
            libCCDAGen.asIsCode(ob, sec_entries_codes.SmokingStatusObservation);
        } else {
            var c = libCCDAGen.code(ob, data[i].code);
            c.node('originalText').node('reference').attr({
                value: "#soc" + i
            });
        }
        ob.node('statusCode').attr({
            code: 'completed'
        });
        var time = libCCDAGen.getTimes(data[i]["date_time"]);
        libCCDAGen.effectiveTime(ob, time);
        if (smoking) {
            libCCDAGen.value(ob, libCCDAGen.reverseTable("2.16.840.1.113883.11.20.9.38", data[i].value), "CD");
        } else {
            libCCDAGen.value(ob, undefined, "ST", undefined, data[i].value);
        }
    }
    xmlDoc = xmlDoc.parent() // end section
    .parent(); // end clinicalDocument
    return isCCD ? xmlDoc : doc;
};