# Contributing

Thanks for taking the time to contribute to this project! If you'd like to learn
how the API works, check out the (unofficial)
[documentation](https://classchartsapi.github.io/api-docs/).

## Dev Setup

### Requirements

- [Deno](https://deno.land/) (for the main development)
- [Node.js](https://nodejs.org/en/) (for testing the NPM package)
- [pnpm](https://pnpm.io/) (for installing dependencies for the NPM package)

### Instructions

To contribute to this repo, you will need to fork the repo first. Click the fork
button in the top right corner of the repo page.

1. Clone your forked repo to your local machine

```bash
git clone https://github.com/<your_github_username>/classcharts-api-js.git
cd classcharts-api-js
```

### Testing

When adding a new function, if you can, add a test for it. Tests are located in
`[FILENAME]_test.ts`.\
To run the tests, run:

```bash
deno test -A
```

The NPM package will automatically be tested when you build it.

### Building

The Deno module is already built but to compile and test the NPM package, run:

```bash
deno task npm 1.0.0
```

Make sure to replace `1.0.0` with the version number.
