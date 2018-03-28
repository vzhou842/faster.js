import {
	isMethodCall,
	basicArrayForLoop,
	defineIdIfNeeded,
	extractDynamicFuncIfNeeded,
} from '../utils';

/**
 * Returns a visitor that rewrites array.forEach() calls as a for loop.
 *
 * Only supports 1 argument:
 *     arr.forEach(f); // valid call with 1 argument
 *     arr.forEach(f, this); // unsupported call with 2 arguments
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;

			if (!isMethodCall(t, expression, 'forEach') ||
				expression.arguments.length !== 1) {
				return;
			}

			const func = extractDynamicFuncIfNeeded(t, path.get('expression'), path);

			const array = defineIdIfNeeded(t, path.get('expression.callee.object'), path);
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
