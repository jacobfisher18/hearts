#!/bin/bash

echo
tput setaf 2
echo "###################"
echo "Starting deployment"
echo "###################"
tput sgr0
echo

# SSH into server
ssh -i "default.pem" ec2-user@ec2-35-173-131-200.compute-1.amazonaws.com << 'ENDSSH'

echo
/bin/echo -e "\e[36mPull the newest code from origin master\e[0m"
cd workdir/hearts/
git reset --hard master
git pull

echo
/bin/echo -e "\e[36m###################\e[0m"
/bin/echo -e "\e[36mDeploying commit:\e[0m"
git log -1 --pretty=%B
/bin/echo -e "\e[36m###################\e[0m"
echo

echo
/bin/echo -e "\e[36mInstall dependencies, build frontend, and move it to the backend directory\e[0m"
cd client
npm install
npm run build
rm -rf ../server/build/
mv build ../server/

echo
/bin/echo -e "\e[36mInstall backend dependencies\e[0m"
cd ../server
npm install

echo
/bin/echo -e "\e[36mReload the app with pm2\e[0m"
pm2 reload hearts

# Exit Server
ENDSSH

echo
tput setaf 2
echo "###################"
echo "Deployment Complete"
echo "###################"
tput sgr0
echo
