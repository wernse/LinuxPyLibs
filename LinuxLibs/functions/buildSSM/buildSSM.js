'use strict';
let async = require('async');
let AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-southeast-2',
    signatureVersion: 'v4'
});
let ssm = new AWS.SSM();

module.exports = {
    sendSSM: sendSSM
}

/*Based on the s3 event
1. Parse s3 event into bucket and key
2. Send SSM cmd to instance 
*/
function sendSSM(event, context, callback) {
    let s3Event = event.Records[0].s3;
    if (!s3Event || s3Event == null) {
        console.log("Error no s3 event")
        callback("Error no s3 Event");
    }
    console.log("s3Event", s3Event)

    //Get key, throw error if length < 2 and the file is not requirements.txt
    let keySplit = s3Event.object.key.split("/");
    if (keySplit.length < 2 && keySplit[1] != 'requirements.txt') {
        callback("Incorrect file uploaded");
        return;
    }

    //S3 parsed object 
    let s3RequirementsTxt = {
        bucket: s3Event.bucket.name,
        key: keySplit[0],
    }

    async.waterfall([
        async.apply(sendSSMApi, s3RequirementsTxt.bucket, s3RequirementsTxt.key)
    ], (err, result) => {
        if (err) {
            console.log("PythonProcess err: ", err)
            callback(err);
            return;
        }
        console.log("PythonProcess result: ", result)
        callback(null, "done")
    })

}

//Build SSM command consisting of bucket and keyId
//e.g. /home/ec2-user/buildLibs.sh xxx 1
let sendSSMApi = (bucket, keyId, callback) => {
    var command = `/home/ec2-user/buildLibs.sh ${bucket} ${keyId}`;

    console.log("ssm command:", command);
    var params = {
        DocumentName: 'AWS-RunShellScript',
        /* required */
        Comment: 'Building Scriots for: ' + bucket + "method: " + keyId,
        InstanceIds: [process.env.buildSSmInstance],
        OutputS3BucketName: 'serverlesslogs',
        OutputS3KeyPrefix: 'build/serverlesslogs',
        Parameters: {
            'commands': [command]
        },
        TimeoutSeconds: 120
    };
    //lambda needs ssm iam
    ssm.sendCommand(params, function (err, result) {
        if (err) {
            console.log("sendCommand err: ", err)
            callback(err);
            return;
        }
        console.log("sendCommand result: ", result)
        callback(null, "done")
    });
}