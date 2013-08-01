#!/bin/bash

REMOTE=play@198.199.78.195
REMOTE_APP=/home/play/zoundlive/

sbt stage || exit 1;
ssh $REMOTE "cd $REMOTE_APP; ./stop.sh";
rsync -va target/ $REMOTE:$REMOTE_APP/target
ssh $REMOTE "cd $REMOTE_APP; ./start.sh";
