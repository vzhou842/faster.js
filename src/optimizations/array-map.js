import { isMethodCall, basicArrayForLoop } from '../utils';

/**
 * Returns a visitor that rewrites array.map() calls as a for loop.
 * Only supports assignments and single declarations:
 *
 * results = arr.map(f); // assignment
 *
 * const results = arr.map(f); // single declaration
 *
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;
			if (!t.isAssignmentExpression(expression) ||
				!t.isIdentifier(expression.left) ||
				expression.operator !== '=' ||
				!isMethodCall(t, expression.right, 'map')) {
				return;
			}

			const assignee = expression.left;

			const initAssignment = t.assignmentExpression('=', assignee, t.arrayExpression());
			path.insertBefore(t.expressionStatement(initAssignment));

			path.replaceWith(forLoop(t, path, assignee, expression.right));
		},

		VariableDeclaration(path, state) {
			if (path.node.declarations.length !== 1) return;

			const declaration = path.node.declarations[0];
			if (!isMethodCall(t, declaration.init, 'map')) {
				return;
			}

			const assignee = declaration.id;

			path.insertAfter(forLoop(t, path, assignee, declaration.init));
			path.get('declarations.0.init').replaceWith(t.arrayExpression());
		},
	};
}

function forLoop(t, path, assignee, mapCall) {
	const array = mapCall.callee.object;
	const func = mapCall.arguments[0];
	const i = path.scope.generateUidIdentifier('i');

	const newMapCall = t.callExpression(func, [t.memberExpression(array, i, true), i, array]);
	const forBody = t.blockStatement([
		t.expressionStatement(
			t.callExpression(
				t.memberExpression(assignee, t.identifier('push')),
				[newMapCall]
			)
		),
	]);

	return basicArrayForLoop(t, i, array, forBody);
}