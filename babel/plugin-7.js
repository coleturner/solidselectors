import { createSelector } from '..';

const moduleName = 'solidselectors';
const createSelectorFnName = 'createSelector';

/**
 * Solid Selectors - Babel Transformer
 * This will replace createSelector calls
 * and remove any dead imports
 * @param {BabelAPI} babel
 * @returns
 */
export default function(babel) {
  const { types: t } = babel;

  // State here is for tracking removed calls
  // Because sometimes the tree mutations are not inline
  const defaultState = { removedCalls: 0, removedMemberExp: 0 };

  /**
   * This visitor is fired when matching imports are found.
   * Here is where the createSelector calls are replaced
   */
  const callVisitor = {
    CallExpression(path) {
      const { callee } = path.node;

      // Member Expression use cases are such as SolidSelectors.createSelector()
      const isMemberExp = callee.type === 'MemberExpression';

      // defaultSpecifierName = SolidSelectors or w/e the user wants
      if (this.defaultSpecifierName && isMemberExp) {
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

      // If there are any provided options, which is not documented
      // Then we hold it in theObject
      let theObject;
      let theVariableDeclarator;

      // Some argument validation to prevent non-literal values
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

      // If the user did some digging and found that the prefix can be customized
      const prefixProperty =
        theObject && theObject.properties.find(n => n.key.name === 'prefix');
      const prefixValue = prefixProperty && prefixProperty.value;

      if (prefixValue && prefixValue.type !== 'StringLiteral') {
        throw new Error(
          `\`${fnName}\` expects option 'prefix' to be a string literal.`,
        );
      }

      const prefixValueLiteral = prefixValue && prefixValue.value;

      if (this.createSelector) {
        const options = prefixValueLiteral
          ? { prefix: prefixValueLiteral }
          : undefined;

        const selector = createSelector(options);
        path.replaceWith(t.stringLiteral(selector));
        this.state.removedCalls += 1;

        if (isMemberExp) {
          this.state.removedMemberExp += 1;
        }
      }

      // Potential bug - if we remove this without capturing all of the function calls
      if (theVariableDeclarator) {
        theVariableDeclarator.remove();
      }
    },
  };

  /**
   * The import visitor works backwards by first
   * checking if there are any imports from `solidselectors`
   */
  const importVisitor = {
    // handle common js
    CallExpression(callPath) {
      if (
        callPath.node.callee.name !== 'require' ||
        !callPath.node.arguments.length
      ) {
        return;
      }

      if (callPath.node.arguments[0].value.value === moduleName) {
        return;
      }

      const varDeclaratorPath = callPath.findParent(n =>
        n.isVariableDeclarator(),
      );
      const varDeclarationPath = callPath.findParent(n =>
        n.isVariableDeclaration(),
      );

      if (!varDeclaratorPath) {
        return;
      }

      const isObject = varDeclaratorPath.node.id.type === 'ObjectPattern';

      const defaultSpecifierName =
        varDeclaratorPath.node.id.type === 'Identifier' &&
        varDeclaratorPath.node.id.name;

      const createSelectorProperty =
        isObject &&
        varDeclaratorPath.node.id.properties.find(
          n => n.key.name === createSelectorFnName,
        );

      const createSelector = isObject
        ? createSelectorProperty && createSelectorProperty.value.name
        : createSelectorFnName;

      const state = { ...defaultState };
      this.programPath.traverse(callVisitor, {
        defaultSpecifierName,
        createSelector,
        state,
      });

      // Remove dead code
      if (isObject) {
        varDeclaratorPath.node.id.properties = varDeclaratorPath.node.id.properties.filter(
          n => n !== createSelectorProperty,
        );

        if (!varDeclaratorPath.node.id.properties.length) {
          varDeclaratorPath.remove();
        }
      } else {
        const { referencePaths } = this.programPath.scope.getBinding(
          defaultSpecifierName,
        );

        if (referencePaths.length === 1) {
          varDeclarationPath.remove();
        }
      }

      if (
        !varDeclarationPath.removed &&
        !varDeclarationPath.node.declarations.length
      ) {
        varDeclarationPath.remove();
      }
    },
    // handle es modules
    ImportDeclaration(importPath) {
      if (importPath.node.source.value !== moduleName) {
        return;
      }

      const defaultSpecifier = importPath.node.specifiers.find(
        n => n.type === 'ImportDefaultSpecifier',
      );

      const defaultSpecifierName =
        defaultSpecifier && defaultSpecifier.local.name;

      const createSelectorImport = importPath.node.specifiers.find(
        n => n.imported && n.imported.name === createSelectorFnName,
      );

      if (!defaultSpecifier && !createSelectorImport) {
        return;
      }

      const createSelector =
        (createSelectorImport && createSelectorImport.local.name) ||
        createSelectorFnName;

      const state = { ...defaultState };
      this.programPath.traverse(callVisitor, {
        defaultSpecifierName,
        createSelector,
        state,
      });

      // Clean up the import, don't need the runtime

      // filter out unused specifiers
      importPath.node.specifiers = importPath.node.specifiers.filter(
        specifier => {
          const { referencePaths } = this.programPath.scope.getBinding(
            specifier.local.name,
          );

          let referencePathsCount = referencePaths.length;

          // For some reason Babel is out of sync here because
          // of the replaceWith() call we do in the callVisitor
          // for Call Expressions.
          if (specifier.local.name === createSelectorFnName) {
            referencePathsCount -= state.removedCalls;
          } else if (specifier.type === 'ImportDefaultSpecifier') {
            referencePathsCount -= state.removedMemberExp;
          }

          return referencePathsCount >= 1;
        },
      );

      if (!importPath.node.specifiers.length) {
        importPath.remove();
      }
    },
  };

  return {
    name: moduleName, // not required
    visitor: {
      Program(programPath) {
        programPath.traverse(importVisitor, { programPath });
      },
    },
  };
}
