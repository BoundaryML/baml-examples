# Monorepo Template

## BAML Specific

This doesn't yet support lambda layers like sstv2 out of the box. If you're interested in setting it up, let us know.

## Install commands (baml)

Note you'll need to install gnu-x64 binary (the runtime AWS uses) for the lambda to work -- even if you're not in that cpu architecture. Which means you need to force install it for it to be included in the final bundle.

### yarn instructions:

`yarn install --ignore-platform` before you run anything

### pnpm

`pnpm install --force`

### npm

`npm install --force`

## Get started

1. Use this template to [create your own repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template).

2. Clone the new repo.

   ```bash
   git clone MY_APP
   cd MY_APP
   ```

3. Rename the files in the project to the name of your app.

   ```bash
   npx replace-in-file '/monorepo-template/g' MY_APP **/*.* --verbose
   ```

4. Deploy!

   ```bash
   npm install
   npx sst deploy
   ```

5. Optionally, enable [_git push to deploy_](https://ion.sst.dev/docs/console/#autodeploy).

## Usage

This template uses [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces). It has 3 packages to start with and you can add more it.

1. `core/`

   This is for any shared code. It's defined as modules. For example, there's the `Example` module.

   ```ts
   export module Example {
     export function hello() {
       return "Hello, world!";
     }
   }
   ```

   That you can use across other packages using.

   ```ts
   import { Example } from "@aws-monorepo/core/example";

   Example.hello();
   ```

2. `functions/`

   This is for your Lambda functions and it uses the `core` package as a local dependency.

3. `scripts/`

   This is for any scripts that you can run on your SST app using the `sst shell` CLI and [`tsx`](https://www.npmjs.com/package/tsx). For example, you can run the example script using:

   ```bash
   npm run shell src/example.ts
   ```

### Infrastructure

The `infra/` directory allows you to logically split the infrastructure of your app into separate files. This can be helpful as your app grows.

In the template, we have an `api.ts`, and `storage.ts`. These export the created resources. And are imported in the `sst.config.ts`.

---

Join the SST community over on [Discord](https://discord.gg/sst) and follow us on [Twitter](https://twitter.com/SST_dev).
