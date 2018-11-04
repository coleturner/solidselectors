import { createSelector } from '..';

export default function(babel) {
  const { types: t } = babel;

  const callVisitor = {
    CallExpression(path) {
      const { callee } = path.node;
      if (this.defaultSpecifierName && callee.type === 'MemberExpression') {
        if (
          callee.object.name !== this.defaultSpecifierName ||
          callee.property.name !== this.createSelector
        ) {
          return;
        }
      } else if (callee.name !== this.createSelector) {
        return;
      }

      const fnName = callee.name;
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
      } else {
        throw new Error('An unknown error has occurred');
      }

      if (theVariableDeclarator) {
        theVariableDeclarator.remove();
      }
    },
  };

  const importVisitor = {
    ImportDeclaration(importPath) {
      if (importPath.node.source.value !== 'pom') {
        return;
      }

      const defaultSpecifier = importPath.node.specifiers.find(
        n => n.type === 'ImportDefaultSpecifier',
      );

      const defaultSpecifierName =
        defaultSpecifier && defaultSpecifier.local.name;

      const createSelectorImport = importPath.node.specifiers.find(
        n => n.imported && n.imported.name === 'createSelector',
      );

      if (!defaultSpecifier && !createSelectorImport) {
        return;
      }

      const createSelector =
        (createSelectorImport && createSelectorImport.local.name) ||
        'createSelector';

      this.programPath.traverse(callVisitor, {
        defaultSpecifierName,
        createSelector,
        importPath,
      });

      // Clean up the import, don't need the runtime
      importPath.remove();
    },
  };

  return {
    name: 'ast-transform', // not required
    visitor: {
      Program(programPath) {
        programPath.traverse(importVisitor, { programPath });
      },
    },
  };
}
