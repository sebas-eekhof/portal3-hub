#!/bin/sh
if [ ! -d "/portal3" ]; then
    mkdir /portal3
fi

if [ ! -d "/portal3/tmp" ]; then
    mkdir /portal3/tmp
fi

cp /root/portal3-hub/system_packages/dymo-cups-drivers-1.4.0.tar.gz /portal3/tmp/dymo-cups-drivers-1.4.0.tar.gz
cd /root/portal3/tmp
tar xvf dymo-cups-drivers-1.4.0.tar.gz
cd dymo-cups-drivers-1.4.0.5/
sudo ./configure
sudo make
sudo make install