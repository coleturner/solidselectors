import { createSelector, createLiveSelector } from '..';

export default function(babel) {
  const { types: t } = babel;


  const callVisitor = {
    CallExpression(path) {
      if (
        path.node.callee.name !== this.createSelector &&
        path.node.callee.name !== this.createLiveSelector
      ) {
        return;
      }

      const fnName = path.node.callee.name;
      const { arguments: fnArguments } = path.node;

      if (fnArguments.length > 1) {
        throw new Error(`\`${fnName}\` expects at most one argument`);
      }

      let theObject;
      let theVariableDeclarator;

      if (fnArguments.length) {
        theObject = fnArguments[0];

        if (fnArguments[0].type !== 'ObjectExpression') {
          if (fnArguments[0].type === 'Identifier') {
            const id = fnArguments[0].name;
            const binding = path.scope.getBinding(id);
            if (binding.path.type !== 'VariableDeclarator') {
              throw new Error(
                `\`${fnName}\` must not reference \`${id}\` from non-variable declaration.`,
              );
            }

            theVariableDeclarator = binding.path;
            if (binding.path.node.init.type === 'ObjectExpression') {
              theObject = binding.path.node.init;
            } else {
              throw new Error(
                `\`${fnName}\` must use reference \`${id}\` to an object, found '${
                  binding.path.node.init.type
                }'.`,
              );
            }
          } else {
            throw new Error(
              `\`${fnName}\` only accepts argument of type object`,
            );
          }
        }

        const hasNonLiteralValue = theObject.properties.find(
          n => !n.value.hasOwnProperty('value'),
        );
        if (hasNonLiteralValue) {
          throw new Error(
            `\`${fnName}\` only accepts object with literal values`,
          );
        }
      }

      const prefixProperty =
        theObject && theObject.properties.find(n => n.key.name === 'prefix');
      const prefixValue = prefixProperty && prefixProperty.value;

      if (prefixValue.type !== 'StringLiteral') {
        throw new Error(
          `\`${fnName}\` expects option 'prefix' to be a string literal.`,
        );
      }

      const prefixValueLiteral = prefixValue.value;

      if (this.createSelector) {
        const selector = createSelector({ prefix: prefixValueLiteral });
        path.replaceWith(t.stringLiteral(selector));
      } else if (this.createLiveSelector) {
        path.replaceWith(t.stringLiteral(`${prefixValueLiteral}:"cool"`));
      } else {
          throw new Error('An unknown error has occurred');
      }

      if (theVariableDeclarator) {
        theVariableDeclarator.remove();
      }
    },
  };

  const importVisitor = {
    ImportDeclaration(path) {
      if (path.node.source.value !== 'pom') {
        return;
      }

      const createSelectorImport = path.node.specifiers.find(
        n => n.imported.name === 'createSelector',
      );

      const createLiveSelectorImport = path.node.specifiers.find(
        n => n.imported.name === 'createLiveSelector',
      );

      if (!createSelectorImport && !createLiveSelectorImport) {
        return;
      }

      const createSelector =
        createSelectorImport && createSelectorImport.local.name;
      const createLiveSelector =
        createLiveSelectorImport && createLiveSelectorImport.local.name;

      console.log(createSelectorImport);
      this.programPath.traverse(callVisitor, {
        createSelector,
        createLiveSelector,
      });
    },
  };

  return {
    name: 'ast-transform', // not required
    visitor: {
      Program(programPath) {
        programPath.traverse(importVisitor, { programPath });
      },import { createLiveSelector } from '..';

    },
  };
}
