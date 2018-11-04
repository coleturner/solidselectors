# ⚔️ Solid Selectors
`v0.1.0`

Automated testing is delicate and takes a lot of effort. Tests can easily break because they rely on class names, or the page selector changed.

Good page selectors wont't change:

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

### Runtime module

Calls to `createSelector()` return a unique, meaningless string. By design it's numbers to discourage hardcoding in source code.

## Todo
- [X] Create Babel 7 plugin & tests
- [ ] Test importing plugin with .babelrc
- [ ] Publish to npm