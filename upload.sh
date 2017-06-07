#!/bin/bash
scp -P 22222\
	/tmp/spacer.tar.gz \
	root@37.139.24.53:/opt/spacer/build.tar.gz
