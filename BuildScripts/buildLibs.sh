#!/bin/bash
LOCATIONENV=/home/ec2-user/my_env/bin/activate
VENDORED=vendored
requirementsTextFile=requirements.txt
requirementsZipFile=libs.zip

# INPUTS from SSM
# ./buildPython.sh linuxpylibs 1 
if [ $# -ne 2 ]; then
    echo $0: usage: s3Bucket s3LocationKey
    exit 1
fi

s3Bucket=$1
s3Key=$2
s3DestinationKey=$s3Key


s3RequirementsLocation=s3://$s3Bucket/$s3Key/$requirementsTextFile
s3DestinationLocation=s3://$s3Bucket/$s3DestinationKey/$requirementsZipFile
filePath=/home/ec2-user/$s3Bucket/$s3Key

#INIT env
echo "Retrieving requirements.txt file from: " $s3RequirementsLocation " and copying to " $filePath/$requirementsTextFile
aws s3 cp $s3RequirementsLocation $filePath/$requirementsTextFile

# #Create requirements
echo "Installing requirements for id: " $s3Key
source $filePath
echo "installing to" $filePath "from" $filePath/$requirementsTextFile

#r is the requirements.txt
pip install -r $filePath/$requirementsTextFile -t $filePath 
echo "Finished requirements for id: " $s3Key

# # #Zip and upload to s3
echo "Zipping file for id: " $s3Key
cd $filePath
zip -r $requirementsZipFile *
aws s3 cp $requirementsZipFile $s3DestinationLocation
