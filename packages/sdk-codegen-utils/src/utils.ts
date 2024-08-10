/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

/* eslint no-console: 0 */
const Reset = '\x1b[0m';
// const Bright = "\x1b[1m"
// const Dim = "\x1b[2m"
// const Underscore = "\x1b[4m"
// const Blink = "\x1b[5m"
// const Reverse = "\x1b[7m"
// const Hidden = "\x1b[8m"
//
// const FgBlack = "\x1b[30m"
const FgRed = '\x1b[31m';
const FgGreen = '\x1b[32m';
const FgYellow = '\x1b[33m';
// const FgBlue = "\x1b[34m"
// const FgMagenta = "\x1b[35m"
const FgCyan = '\x1b[36m';
// const FgWhite = "\x1b[37m"
//
// const BgBlack = "\x1b[40m"
// const BgRed = "\x1b[41m"
// const BgGreen = "\x1b[42m"
// const BgYellow = "\x1b[43m"
// const BgBlue = "\x1b[44m"
// const BgMagenta = "\x1b[45m"
// const BgCyan = "\x1b[46m"
// const BgWhite = "\x1b[47m"

// Abstraction of log so it can be skipped when quiet mode is enabled
export const log = (message?: any) => {
  console.log(message);
  return message;
};

const reset = (message: any) => `${message}${Reset}`;

export const info = (message: any) => log(reset(`${FgCyan}${message}`));

export const warn = (message: any) => log(reset(`${FgYellow}${message}`));

export const danger = (message: any) => {
  return log(reset(`${FgRed}${message}`));
};

export const success = (message: any) => {
  return log(reset(`${FgGreen}${message}`));
};

export const debug = (message: any, value?: any) => {
  if (value !== undefined)
    console.log(message, '=>', JSON.stringify(value, null, 2));
  else return log(message);
};

export const dump = (value: any) => log(JSON.stringify(value, null, 2));
