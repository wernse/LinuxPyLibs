#!/bin/bash
LOCATIONENV=/home/ec2-user/my_env/bin/activate
VENDORED=vendored
REQUIREMENTS=requirements.txt
# ./buildPython.sh serverlessusers/user123/get/new templated.py
if [ $# -ne 2 ]; then
    echo $0: usage: myscript s3LocationKey filename
    exit 1
fi

s3LocationKey=$1
s3FileName=$2
S3LOCATIONPY=s3://$s3LocationKey/$s3FileName
zip=lambda.zip
LOCALDEST=/home/ec2-user/serverlessusers/lambda/$s3LocationKey
ZIPLoc=$LOCALDEST$zip
S3DEST=s3://$s3LocationKey/lambda.zip

rm -rf $LOCALDEST

#INIT env
echo "Putting python in location: " $LOCALDEST/$s3FileName " from " $S3LOCATIONPY
aws s3 cp $S3LOCATIONPY $LOCALDEST/$s3FileName

# #Create requirements
echo "Installing requirements for: " $LOCALDEST
source $LOCATIONENV
pipreqs $LOCALDEST
echo "installing to" $LOCALDEST/$VENDORED "from"  $LOCALDEST/$REQUIREMENTS
pip install -t $LOCALDEST/$VENDORED -r $LOCALDEST/$REQUIREMENTS
echo "Finished requirements: " $LOCALDEST

# # #Zip and upload to s3
cd $LOCALDEST
zip -r $zip *
ls
aws s3 cp $zip $S3DEST
echo "Removing previous folder"
rm -rf $LOCALDEST
