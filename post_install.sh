#!/bin/sh
if [ ! -d "/portal3" ]; then
    mkdir /portal3
fi

if [ ! -d "/portal3/tmp" ]; then
    mkdir /portal3/tmp
fi

cd /portal3/tmp
wget http://download.dymo.com/Download%20Drivers/Linux/Download/dymo-cups-drivers-1.4.0.tar.gz
cd dymo-cups-drivers-1.4.0.5/
sudo ./configure
sudo make
sudo make install