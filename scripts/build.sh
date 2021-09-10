#!/bin/bash
cd ../app
meteor build --server-only ../docker/builds
cd -

