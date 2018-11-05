import uuidv4 from 'uuid';

/**
 * Responsible for keying individual calls
 * @returns {String} a unique value for this call
 */
function reserveNamespace() {
  const namespace = uuidv4();

  return namespace;
}

/**
 * Creates a singular page selector
 * @param {String} .prefix to prepend to the selector
 * @returns {String}
 */
export function createSelector({ prefix = 'solid-selector' } = {}) {
  const namespace = reserveNamespace();
  return `${prefix}:${namespace}`;
}

export default {
  createSelector,
};
