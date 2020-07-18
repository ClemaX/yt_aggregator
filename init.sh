#!/bin/sh

if [ $EUID -ne 0 ]
	then
	echo "This script must be run as root"
	exit 1
fi

if [ -z "$1" ]
	then
	echo "Usage:	$0 name"
	exit 1
fi

USER="$1-data"
WWW="/srv/$1"
OUT="$WWW/yt_uploads.json"

adduser $USER

mkdir -p "$WWW"
touch "$OUT"
chown $USER:$USER "$OUT"

systemctl enable yt-aggregator@$USER
exit 0
