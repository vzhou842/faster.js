import {
	isIdAssignment,
	isMethodCall,
	basicArrayForLoop,
	defineIdIfNeeded,
	extractDynamicFuncIfNeeded,
} from '../utils';

/**
 * Returns a visitor that rewrites array.map() calls as a for loop.
 *
 * Only supports assignments and single declarations:
 *     results = arr.map(f); // assignment
 *     const results = arr.map(f); // single declaration
 *
 * Only supports 1 argument:
 *     arr.map(f); // call with 1 argument will get compiled
 *     arr.map(f, this); // call with 2 arguments won't get compiled
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;
			if (!isIdAssignment(t, expression) ||
				!isMethodCall(t, expression.right, 'map') ||
				expression.right.arguments.length !== 1) {
				return;
			}

			const assignee = expression.left;

			const initAssignment = t.assignmentExpression('=', assignee, t.arrayExpression());
			path.insertBefore(t.expressionStatement(initAssignment));

			path.replaceWith(forLoop(t, path, assignee, path.get('expression.right')));
		},

		VariableDeclaration(path, state) {
			if (path.node.declarations.length !== 1) return;

			const declaration = path.node.declarations[0];
			if (!isMethodCall(t, declaration.init, 'map') ||
				declaration.init.arguments.length !== 1) {
				return;
			}

			const assignee = declaration.id;

			const mapPath = path.get('declarations.0.init');
			path.insertAfter(forLoop(t, path, assignee, mapPath));
			mapPath.replaceWith(t.arrayExpression());
		},
	};
}

function forLoop(t, path, assignee, mapPath) {
	const array = defineIdIfNeeded(t, mapPath.get('callee.object'), path);
	const func = extractDynamicFuncIfNeeded(t, mapPath, path);
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
