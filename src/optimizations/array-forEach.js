/**
 * Returns a visitor that rewrites array.forEach() calls as a for loop.
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;

			if (!t.isCallExpression(expression) ||
				!t.isMemberExpression(expression.callee) ||
				expression.callee.property.name !== 'forEach' ||
				expression.arguments.length > 1) {
				return;
			}

			const array = expression.callee.object;
			const func = expression.arguments[0];
			const i = path.scope.generateUidIdentifier('i');

			const forInit = t.VariableDeclaration("let", [
				t.VariableDeclarator(i, t.numericLiteral(0)),
			]);
			const forTest = t.binaryExpression('<', i, t.memberExpression(array, t.identifier('length')));
			const forUpdate = t.unaryExpression('++', i, false);
			const forBody = t.blockStatement([
				t.expressionStatement(
					t.callExpression(func, [t.memberExpression(array, i, true), i, array])
				),
			]);

			path.replaceWith(t.forStatement(forInit, forTest, forUpdate, forBody));
		}
	};
}
