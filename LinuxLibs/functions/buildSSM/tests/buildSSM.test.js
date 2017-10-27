let event = {
    "Records": [{
        "s3": {
            "bucket": {
                "name": "linuxlibbuilder",
            },
            "object": {
                "key": "1/requirements.txt",
                "size": 55,
                "eTag": "8d25ebd9a474f9e0f259cf1d08fbf0f6",
                "sequencer": "00593516223D758C4E"
            }
        }
    }]
}
let context = "";

let buildSSM = require('../buildSSM.js');
buildSSM.sendSSM(event, context,
    (err, result) => {
        console.log("err:", err);
        console.log("result:", result);
    })