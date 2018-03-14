import { isIdMethodCall, basicArrayForLoop } from '../utils';

/**
 * Returns a visitor that rewrites array.forEach() calls as a for loop.
 *
 * Only supports calls on identifiers:
 *     array.forEach(f); // called on identifier 'array'
 *     [1, 2].forEach(f); // not called on an identifier
 *
 * Only supports 1 argument:
 *     arr.forEach(f); // valid call with 1 argument
 *     arr.forEach(f, this); // valid call with 2 arguments
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;

			if (!isIdMethodCall(t, expression, 'forEach') ||
				expression.arguments.length !== 1) {
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
