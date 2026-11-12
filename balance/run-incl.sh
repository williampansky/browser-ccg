#!/bin/bash
# usage: balance/run-incl.sh <name> <comma-separated patch files|none> [games per shard, default 1000] [core|prime|both]
cd "$(dirname "$0")/.."; O='{"module":"commonjs","target":"es2019","resolveJsonModule":true,"esModuleInterop":true}'
mkdir -p /tmp/incl; rm -f /tmp/incl/$1-*
for i in $(seq 1 12); do npx ts-node --compiler-options "$O" balance/inclusion.node.ts "$2" ${3:-1000} $((i*100003)) /tmp/incl/$1-$i.json ${4:-core} & done; wait
node balance/merge.node.js /tmp/incl/$1- "$2"
