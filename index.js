import { createFactory } from 'react';

let count = 0;

/**
 * Responsible for keying individual calls
 * @returns {String} a unique value for this call
 */
function reserveNamespace() {
  let namespace = count;
  count++;

  return namespace.toString();
}

/**
 * Creates a singular page selector
 * @param {String} .prefix to prepend to the selector
 * @returns {String}
 */
export function createSelector({ prefix = 'pom' } = {}) {
  const namespace = reserveNamespace();
  return `${prefix}:${namespace}`;
}
