import { isMethodCall, basicArrayForLoop } from '../utils';

/**
 * Returns a visitor that rewrites array.forEach() calls as a for loop.
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;

			if (!isMethodCall(t, expression, 'forEach') ||
				expression.arguments.length > 1) {
				return;
			}

			const array = expression.callee.object;
			const func = expression.arguments[0];
			const i = path.scope.generateUidIdentifier('i');

			const forBody = t.blockStatement([
				t.expressionStatement(
					t.callExpression(func, [t.memberExpression(array, i, true), i, array])
				),
			]);

			path.replaceWith(basicArrayForLoop(t, i, array, forBody));
		}
	};
}
