mkdir -p ../../FABulous/$1
cp -a ../../FABulous/fabric_generator/. ../../FABulous/$1/
cd ../../FABulous/$1
../../FABulous/$1/create_basic_files.sh uploads/$1/data.csv
../../FABulous/$1/run_fab_flow.sh $2 $3
