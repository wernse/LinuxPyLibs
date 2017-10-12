'use strict';
let async = require('async');
let AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-southeast-2',
    signatureVersion: 'v4'
});
let ssm = new AWS.SSM();

module.exports = {
    upload: upload
}

function upload(event, context, callback) {
    let s3Event = event.Records[0].s3;
    if (!s3Event || s3Event == null) {
        console.log("Error no s3 event")
        callback("Error no s3 Event");
    }
    console.log("s3Event", s3Event)
    let s3RequirementsTxt = {
        bucket: s3Event.bucket.name,
        key: s3Event.object.key
    }
    async.waterfall([
        async.apply(sendSSM, s3RequirementsTxt.bucket, s3RequirementsTxt.key)
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

let sendSSM = (bucket, folderKey, callback) => {
    var command = `/home/ec2-user/buildLibs.sh ${bucket} ${folderKey}`;

    console.log("ssm command:", command);
    var params = {
        DocumentName: 'AWS-RunShellScript',
        /* required */
        Comment: 'Building Scriots for: ' + bucket + "method: " + folderKey,
        InstanceIds: [process.env.buildSSmInstance],
        OutputS3BucketName: 'serverlesslogs',
        OutputS3KeyPrefix: 'build/serverlesslogs',
        Parameters: {
            'commands': [command],
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