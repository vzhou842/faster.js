import {
	isIdAssignment,
	isMethodCall,
	basicArrayForLoop,
	defineId,
	defineIdIfNeeded,
	extractDynamicFuncIfNeeded,
} from '../utils';

/**
 * Returns a visitor that rewrites array.filter() calls as a for loop.
 *
 * Only supports assignments and single declarations:
 *     results = arr.filter(f); // assignment
 *     const results = arr.filter(f); // single declaration
 *
 * Only supports 1 argument:
 *     arr.filter(f); // call with 1 argument will get compiled
 *     arr.filter(f, this); // call with 2 arguments won't get compiled
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;
			if (!isIdAssignment(t, expression) ||
				!isMethodCall(t, expression.right, 'filter') ||
				expression.right.arguments.length !== 1) {
				return;
			}

			const filterPath = path.get('expression.right');
			const assignee = expression.left;

			// If the array is the assignee, we need a temp var to hold the array.
			const array = expression.right.callee.object;
			if (t.isIdentifier(array) && array.name === assignee.name) {
				filterPath.get('callee.object').replaceWith(defineId(t, path, array, 'const', 'arr'));
			}

			const initAssignment = t.assignmentExpression('=', assignee, t.arrayExpression());
			path.insertBefore(t.expressionStatement(initAssignment));

			path.replaceWith(forLoop(t, path, assignee, filterPath));
		},

		VariableDeclaration(path, state) {
			if (path.node.declarations.length !== 1) return;

			const declaration = path.node.declarations[0];
			if (!isMethodCall(t, declaration.init, 'filter') ||
				declaration.init.arguments.length !== 1) {
				return;
			}

			const assignee = declaration.id;

			const filterPath = path.get('declarations.0.init');
			path.insertAfter(forLoop(t, path, assignee, filterPath));
			filterPath.replaceWith(t.arrayExpression());
		},
	};
}

function forLoop(t, path, assignee, filterPath) {
	const array = defineIdIfNeeded(t, filterPath.get('callee.object'), path);
	const func = extractDynamicFuncIfNeeded(t, filterPath, path);
	const i = path.scope.generateUidIdentifier('i');
	const element = t.memberExpression(array, i, true);

	const newFilterCall = t.callExpression(func, [element, i, array]);
	const forBody = t.blockStatement([
		t.ifStatement(
			newFilterCall,
			t.expressionStatement(t.callExpression(
				t.memberExpression(assignee, t.identifier('push')),
				[element]
			))
		),
	]);

	return basicArrayForLoop(t, i, array, forBody);
}
