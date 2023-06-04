# Juhanify

A small helper script (work in progress) to spin up a React app using esbuild with minimal everything.

## Usage example

Fetch the script with curl and pipe it into Nodejs. Node will need the input type option as module. The last argument is the name of the folder in which to create the app.

```sh
curl https://raw.githubusercontent.com/JHNUL/juhanify/main/juhanify.mjs \
| node --input-type=module - newapp
```