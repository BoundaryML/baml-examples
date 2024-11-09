Source is from this tutorial:

https://sst.dev/examples/how-to-create-a-rest-api-with-serverless.html

https://github.com/sst/sst/tree/master/examples/rest-api

Main changes:

1. deploy script first prepares a lambda layer with the BAML node binary for linux x86_64
2. packages/stacks/ExampleStack.ts has the lambda layer setup, and local dev setup
