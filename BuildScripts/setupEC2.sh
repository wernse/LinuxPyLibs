chmod 400 linuxlibbuilder.pem
ssh -i linuxlibbuilder.pem ec2-user@ec2-54-206-127-90.ap-southeast-2.compute.amazonaws.com

sudo yum install -y python36-setuptools
sudo easy_install-3.6 pip