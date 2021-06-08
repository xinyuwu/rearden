#!/bin/bash

yourfilenames=`ls -d */`

for directory in $yourfilenames
do
  name=${directory%?}
  if [ $name != "grafana-graph-panel" ] && [ $name != "dummy-data-source" ];
  then
    cd $directory
    echo $name
    pwd
    zip "${name}.zip" $name -r
    mv "${name}.zip" ..
    rm -rf $name
    cd ..
  fi
done
