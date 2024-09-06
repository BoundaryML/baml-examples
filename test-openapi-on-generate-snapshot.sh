#!/bin/bash

# This script is a manual test that on_generate is bootstrapped with the right thing
# Assuming the contents of baml-examples are an appropriate snapshot
# Verify by confirming that the diff only consists of whitespace

set -euxo pipefail

for lang in go java php ruby rust
do
  cd "${lang}"*"-openapi-starter"
  rm -rf baml_src
  ~/baml/engine/target/debug/baml-runtime init --client-type rest/openapi --openapi-client-type $lang
  git diff baml_src/generators.baml
  git reset --hard
  cd ..
  sleep 3
done

