# 🐩 Page Object Model (Concept)

For lack of a better name, here's what I imagine an ideal contract for page selectors and testing.

## Concept

Automated testing is hard - it's brittle and takes a lot of effort to keep it happy. One of the most frequent issues is when elements change class names and your tests break. What if page selectors were easy? What if we didn't care what their value was?

```js
// js/components/TodoList.js

import POM from 'pom';

export const TODO_LIST_SELECTOR = POM.createSelector();

export function TodoList({ items }) {
    return (
        <div data-testid={TODO_LIST_SELECTOR}>
            {items.map(item => <TodoItem key={item.id} {...item} />)}
        </div>
    )
}

export const TODO_ITEM_SELECTOR = POM.createLiveSelector();

export function TodoItem({ id, text }) {
    const testId = TODO_ITEM_SELECTOR.strict(id);

    return (
        <div data-testid={testId}>
            {text}
        </div>
    )
}
```

## Implementation

Babel will replace `POM.createSelector()` and `POM.createLiveSelector()` ahead-of-time so that the values are idempotent and unique. These references can be imported into your test code which can be used in place of current string-based selectors.

- `createSelector()` will be transpiled with a unique string literal.
- `createLiveSelector()` will be transpiled with a function that takes in a string and retuns a string literal hashed against a unique salt.

In doing so, test code becomes more reliable because the value of the string no longer matters. Selectors become easier to maintain as the cognitive load of naming and searching is no longer.

## Work in Progress

- [X] Fallback runtime (when no Babel plugin is present)
- [ ] Babel 7 Plugin
- [ ] Babel 6 Plugin
- [ ] Babel macro
- [ ] Eslint plugin for best practices