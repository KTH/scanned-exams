/* eslint-disable */
/**
 * For runtime input param testing
 * @param {bool|function} test Test case that should return true
 * @param {string} msg Error message
 */
export function assert(test, msg) {
  if ((typeof test === "function" && !test()) || !test) {
    throw Error(msg);
  }
}
