import browser from "webextension-polyfill";
import { injectScript } from "../../inject";
import { messages } from "../../constants";

/**
 * Functions to get the state of the Bitbucket UI
 */

export const isRunningInBitbucket = () => {
  const metaTag = document.querySelector("meta[name=application-name]");
  return metaTag === null
    ? false
    : metaTag.getAttribute("content") === "Bitbucket";
};

export const getBitbucketDiffElement = () =>
  document.querySelector(".diff-view");

export const getBitbucketFilePreviewElement = () =>
  document.querySelector(".source-view");

export const getCurrentFile = () => {
  // Since chrome doesn't allow you to access the page context at all
  // this is the best way I can find to determine the file path of the
  // file being currently diffed.
  // Not ideal but will have to do for now.
  const diffElement = document.querySelector("a.difftree-file.jstree-clicked");
  if (diffElement == null) {
    throw new Error("[Mule Preview] Cannot determine diff target from DOM");
  }
  const urlComponents = diffElement.href.split("#");
  if (urlComponents.length !== 2) {
    throw new Error("[Mule Preview] Cannot determine diff target from DOM");
  }
  return urlComponents[1];
};

export const getBitbucketData = async () => {
  return new Promise((resolve, reject) => {
    document.addEventListener(messages.BitbucketDataScraped, function({
      detail
    }) {
      console.log(`Recieved [${messages.BitbucketDataScraped}] event!`);
      resolve(detail);
    });
    setTimeout(
      () => reject(new Error("Took too long to scrape Bitbucket data")),
      1000
    );
    injectScript(browser.extension.getURL("dist/scraper.js"), "body");
  });
};

export const getFileRawUrlFromContentView = () => {
  // This is not the best but it works for now I suppose
  return document.URL.replace("/browse/", "/raw/");
};
