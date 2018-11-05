# ⚔️ Solid Selectors

Automated testing is delicate and takes a lot of effort. Tests can easily break because they rely on class names, or the page selector changed.

Good page selectors won't change:

```js
// TodoList.js

import { createSelector } from 'solidselectors';

export const TODO_LIST_SELECTOR = createSelector();

export function TodoList({ items }) {
    return (
        <div data-testid={TODO_LIST_SELECTOR}>
            {items.map(item => <TodoItem key={item.id} {...item} />)}
        </div>
    );
}

// test.js
import { TODO_LIST_SELECTOR } from './TodoList';

browser.click(`[data-testid="${TODO_LIST_SELECTOR}]`);
```

## Abstract
Hours of debugging saves minutes from using good selectors. Tests that use class names or dynamic selectors are flakey and break more often. A strong contract between test and runtime code can fix that. 

### I can already do this with strings...
- Separate from CSS makes the intention clearer
- Selectors are coupled, requiring no changes later
- Broken page objects will fail faster and louder - rather than waiting for the test to run it will surface during initialization of runtime.

Strings would be easier. This solution adds a small amount of complexity. The time spent updating selectors, waiting for tests to fail, and debugging - is all time you can use to pet more dogs (and cats).

## How it works
### Babel plugin

The Babel plugin is optional but recommended. When it transpiles - the `createSelector()` calls will be replaced with strings and the `import { createSelector }` statements are removed 🎉

If you don't use the Babel plugin - be careful not to mutate the `require.cache` module cache. Doing so could cause the `solidselectors` package to lose its singleton data structures. 

### Runtime module

Calls to `createSelector()` return a unique, meaningless string. By design it's numbers to discourage hardcoding in source code.

## Installation

The first step is adding the dependencies:

```sh
# npm
npm install --save solidselectors

# yarn 
yarn add solidselectors
```

(Optional but recommended): add the Babel plugin:

```json
{ 
    "plugins": ["solidselectors/babel/plugin-7"]
}
```
You're ready to start using Solid Selectors. If you run into any trouble please feel free to open an issue. Contributions and feedback are warmly welcomed.