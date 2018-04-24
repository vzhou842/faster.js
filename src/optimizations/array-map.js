import {
	isIdAssignment,
	isMethodCall,
	basicArrayForLoop,
	defineId,
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
export default t => ({
	ExpressionStatement(path, state) {
		const expression = path.node.expression;
		if (!isIdAssignment(t, expression) ||
			!isMethodCall(t, expression.right, 'map') ||
			expression.right.arguments.length !== 1) {
			return;
		}

		const mapPath = path.get('expression.right');
		const assignee = expression.left;

		// If the array is the assignee, we need a temp var to hold the array.
		let array = expression.right.callee.object;
		if (t.isIdentifier(array) && array.name === assignee.name) {
			array = defineId(t, path, array, 'const', 'arr');
			mapPath.get('callee.object').replaceWith(array);
		} else {
			array = getArray(t, path, mapPath);
		}

		const initAssignment = t.assignmentExpression('=', assignee, arrayAllocExpression(t, array));
		path.insertBefore(t.expressionStatement(initAssignment));

		path.replaceWith(forLoop(t, path, array, assignee, mapPath));
	},

	VariableDeclaration(path, state) {
		if (path.node.declarations.length !== 1) return;

		const declaration = path.node.declarations[0];
		if (!isMethodCall(t, declaration.init, 'map') ||
			declaration.init.arguments.length !== 1) {
			return;
		}

		const mapPath = path.get('declarations.0.init');

		const assignee = declaration.id;
		const array = getArray(t, path, mapPath);

		path.insertAfter(forLoop(t, path, array, assignee, mapPath));
		mapPath.replaceWith(arrayAllocExpression(t, array));
	},
});

/**
 * Returns an expression representing:
 *     new Array(array.length)
 */
function arrayAllocExpression(t, array) {
	return t.newExpression(t.identifier('Array'), [
		t.memberExpression(array, t.identifier('length')),
	]);
}

function getArray(t, path, mapPath) {
	return defineIdIfNeeded(t, mapPath.get('callee.object'), path);
}

function forLoop(t, path, array, assignee, mapPath) {
	const func = extractDynamicFuncIfNeeded(t, mapPath, path);
	const i = path.scope.generateUidIdentifier('i');

	const newMapCall = t.callExpression(func, [t.memberExpression(array, i, true), i, array]);
	const forBody = t.blockStatement([
		t.expressionStatement(
			t.assignmentExpression(
				'=',
				t.memberExpression(assignee, i, true),
				newMapCall
			)
		),
	]);

	return basicArrayForLoop(t, i, array, forBody);
}
