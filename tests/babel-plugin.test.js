import pluginTester from 'babel-plugin-tester';
import plugin from '../babel/plugin-7';

pluginTester({
  plugin,
  snapshot: true,
  tests: [
    // Standard, full dead code elimination
    `
        import { createSelector } from 'pom';
        const selector = createSelector({ prefix: 'cool '});
      `,
    `
        import POM from 'pom';
        const selector = POM.createSelector({ prefix: 'cool '});
    `,
    `
        const { createSelector } = require('pom');
        const selector = createSelector({ prefix: 'cool '});
    `,
    `
        const POM = require('pom');
        const selector = POM.createSelector({ prefix: 'cool '});
    `,

    // Leftover imports
    `
        import POM, { createSelector, somethingElse } from 'pom';
        const selector = createSelector({ prefix: 'cool '});
        POM.keepsThis();
        POM.keepsThat();
        somethingElse('stays too');
    `,
    `
        const { createSelector, somethingElse } = require('pom');
        const selector = createSelector({ prefix: 'cool '});
        somethingElse('stays put');
    `,
    `
        const { createSelector, somethingElse } = require('pom');
        const selector = createSelector({ prefix: 'cool '});
        somethingElse('stays put');
        somethingElse('stays put');
    `,
  ],
});
