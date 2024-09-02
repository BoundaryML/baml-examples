if (typeof Promise.withResolvers === "undefined") {
  // @ts-expect-error This does not exist outside of polyfill which this is doing
  global.Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import PDFExtractor from "./PDFExtractor";

export default function Page() {
  return <PDFExtractor />;
}
