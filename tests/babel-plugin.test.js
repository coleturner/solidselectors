import pluginTester from 'babel-plugin-tester';
import plugin from '../src/babel/plugin-7';

const { name } = require('../package.json');

pluginTester({
  plugin,
  snapshot: true,
  tests: [
    // Standard, full dead code elimination
    `
        import { createSelector } from '${name}';
        const selector = createSelector({ prefix: 'cool '});
      `,
    `
        import POM from '${name}';
        const selector = POM.createSelector({ prefix: 'cool '});
    `,
    `
        const { createSelector } = require('${name}');
        const selector = createSelector({ prefix: 'cool '});
    `,
    `
        const POM = require('${name}');
        const selector = POM.createSelector({ prefix: 'cool '});
    `,

    // Leftover imports
    `
        import POM, { createSelector, somethingElse } from '${name}';
        const selector = createSelector({ prefix: 'cool '});
        POM.keepsThis();
        POM.keepsThat();
        somethingElse('stays too');
    `,
    `
        const { createSelector, somethingElse } = require('${name}');
        const selector = createSelector({ prefix: 'cool '});
        somethingElse('stays put');
    `,
    `
        const { createSelector, somethingElse } = require('${name}');
        const selector = createSelector({ prefix: 'cool '});
        somethingElse('stays put');
        somethingElse('stays put');
    `,
  ],
});
