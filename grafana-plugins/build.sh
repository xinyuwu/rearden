#!/bin/bash

yourfilenames=`ls -d */`

for directory in $yourfilenames
do
  name=${directory%?}
  if [ $name != "grafana-graph-panel" ];
  then
    cd $directory
    echo $name
    pwd
    # rm -rf $name
    yarn dev
    # mv dist $name
    cd ..
  fi
done
