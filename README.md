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
```

## Implementation

Babel will replace `POM.createSelector()` ahead-of-time so that the values are idempotent and unique. These references can be imported into your test code which can be used in place of current string-based selectors.

- `createSelector()` will be transpiled with a unique string literal.

In doing so, test code becomes more reliable because the value of the string no longer matters. Selectors become easier to maintain as the cognitive load of naming and searching is no longer.

## Why this?

Hours of debugging broken tests can save minutes from using good selectors. Tests break so often because we rely on flakey factors like class names or dynamic strings. This costs so much in time and money. 

A strong contract between test and runtime code can fix that. With this concept it's the reference that matters, not the value. Because there's no value, you never have to update the selector.

**Why is that better?**
- Separate from CSS makes the intention clearer
- Selectors remain constant, requiring no changes later
- Broken page objects will fail faster and louder - rather than waiting for the test to run it will surface during initialization of runtime.



## Work in Progress

- [X] Fallback runtime (when no Babel plugin is present)
- [X] Babel 7 Plugin
- [ ] Eslint plugin for best practices