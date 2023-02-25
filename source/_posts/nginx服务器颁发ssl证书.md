---
title: nginx服务器颁发ssl证书
date: 2020-12-15 20:11:25
#index_img: https://demos.xiaoooyooo.site/picture?tag=010
tags:
	- 服务器
	- nginx
	- ssl证书
categories:
	- 服务器
---

1. [安装`snap`](https://snapcraft.io/docs/installing-snap-on-centos)

   + Adding EPEL to CentOS 8

     ```bash
     $ sudo dnf install epel-release
     $ sudo dnf upgrade
     ```

   + Installing snapd

     ```bash
     # With the EPEL repository added to your CentOS installation, simply install the snapd package:
     $ sudo yum install snapd
     
     # Once installed, the systemd unit that manages the main snap communication socket needs to be enabled:
     $ sudo systemctl enable --now snapd.socket
     
     #To enable classic snap support, enter the following to create a symbolic link between /var/lib/snapd/snap and /snap:
     $ sudo ln -s /var/lib/snapd/snap /snap
     
     #Either log out and back in again or restart your system to ensure snap’s paths are updated correctly.
     ```

2. Ensure that your version of snapd is up to date

   ```bash
   $ sudo snap install core
   $ sudo snap refresh core
   ```

3. Remove any Certbot OS packages

   ```bash
   $ sudo apt-get remove certbot
   # or
   $ sodu dnf remove certbot
   # or
   $ sudo yum remove certbot
   ```

4. Install Certbot

   + Run this command on the command line on the machine to install Certbot.

     ```bash
     $ sudo snap install --classic certbot
     ```

   + Execute the following instruction on the command line on the machine to ensure that the `certbot` command can be run.

     ```bash
     $ sudo ln -s /snap/bin/certbot /usr/bin/certbot
     ```

   + Run this command on the command line on the machine to acknowledge that the installed plugin will have the same `classic` containment as the Certbot snap.

     ```bash
     $ sudo snap set certbot trust-plugin-with-root=ok
     # If you encounter issues with running Certbot, you may need to follow this step, then the "Install correct DNS plugin" step, again.
     ```

5. 获取证书

   ```bash
   $ certbot certonly
   ```

   

