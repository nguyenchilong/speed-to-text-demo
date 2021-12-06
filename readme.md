# Demo Extract Text from Media
- This repo for demo `Speed to Text` with simple media type are `MP4 & MP3`

## Run localhost
- Install [NodeJS](https://nodejs.org/en/), [Yarn](https://yarnpkg.com/) or [NPM](https://www.npmjs.com/) `NPM is default in node and already include when install node successfully`
- Install [FFmpeg](http://www.ffmpeg.org/) for convert `MP4 => MP3`
- Get credentials of google to call APIs `already in source but can change if want`
- Run command to install node packages
```shell
yarn install
# or
npm install
```
- After done then rename file `.env.example` to `.env` then can update value or keep the same for run test
- Run command `yarn run start` then open browser with `http://localhost:PORT` PORT default is `3002`
- Please use file mp3/mp4 include in this repo for test, if use other please choose file less 1 minute for test, because here for a simple demo not support big file