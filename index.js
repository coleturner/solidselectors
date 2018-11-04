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

/**
 * Creates a factory for live selectors such as list items
 * @param {String} .prefix to prepend to each selector
 * @returns {Function} takes in a key:String and returns selector:String
 */
export function createLiveSelector({ prefix = 'pom' } = {}) {
  const namespace = reserveNamespace();
  const factory = function(key) {
    let value = key && key.toString();

    if (key === undefined || key === null) {
      value = `broken-selector:${value}`;
    }

    return `${prefix}:${namespace}:${value}`;
  };

  // Strict selectors track usage to ensure the same key isn't used in looping operations
  // Useful for ensuring that your selectors are truly unique, by making the developer think
  // of when to reserve the selector.
  const used = [];

  // A subset of the factory that ensures strict compliance
  factory.strict = key => {
    if (used.includes(key)) {
      throw new Error(
        `Duplicate key ${key} was already reserved as a strict selector.`,
      );
    }

    if (key === null || key === undefined) {
      throw new Error(`Provided invalid value \`${key}\` for selector key.`);
    }

    used.push(key);
    return factory(key);
  };

  return factory;
}
