'use strict';
let async = require('async');
let AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-southeast-2',
    signatureVersion: 'v4'
});
let ssm = new AWS.SSM();

let sendSSM = (apiInput, item, callback) => {
    var command = `/home/ec2-user/bash/buildServerless.sh ${apiInput.bucket}/${apiInput.folderKey} ${apiInput.templateName} ${process.env.defaultPyName} ${process.env.snsTopic}`;

    console.log("ssm command:", command);
    var params = {
        DocumentName: 'AWS-RunShellScript',
        /* required */
        Comment: 'Building Serverless for: ' + apiInput.username + "method: " + apiInput.functionName,
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