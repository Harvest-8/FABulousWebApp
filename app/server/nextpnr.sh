cd ../../FABulous/nextpnr/fabulous/$1/
nextpnr-fabulous --pre-pack fab_arch.py --pre-place fab_timing.py --json $2 --router router2 --post-route bitstream.py
