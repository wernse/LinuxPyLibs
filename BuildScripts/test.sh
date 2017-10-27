#Testing
s3Bucket=linuxlibbuilder

s3RequirementsLocation=s3://linuxlibbuilder/1/libs.zip
aws s3 cp libs.zip s3://linuxlibbuilder/1/libs.zip


aws s3 cp requirements.txt s3://linuxlibbuilder/1/requirements.txt
