import { isIdAssignment, isIdMethodCall, basicArrayForLoop } from '../utils';

/**
 * Returns a visitor that rewrites array.map() calls as a for loop.
 *
 * Only supports calls on identifiers:
 *     array.map(f); // called on identifier 'array'
 *     [1, 2].map(f); // not called on an identifier
 *
 * Only supports assignments and single declarations:
 *     results = arr.map(f); // assignment
 *     const results = arr.map(f); // single declaration
 *
 * Only supports 1 argument:
 *     arr.map(f); // valid call with 1 argument
 *     arr.map(f, this); // valid call with 2 arguments
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;
			if (!isIdAssignment(t, expression) ||
				!isIdMethodCall(t, expression.right, 'map') ||
				expression.right.arguments.length !== 1) {
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
			if (!isIdMethodCall(t, declaration.init, 'map')) {
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