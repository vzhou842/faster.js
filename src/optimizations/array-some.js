import {
	isIdAssignment,
	isMethodCall,
	basicArrayForLoop,
	defineId,
	defineIdIfNeeded,
	extractDynamicFuncIfNeeded,
} from '../utils';

export default createVisitor(false);

/**
 * Returns a function that returns a  visitor that rewrites
 * array.some() or array.every() calls as a for loop.
 *
 * Only supports assignments and single declarations:
 *     result = arr.some(f); // assignment
 *     const result = arr.some(f); // single declaration
 *
 * Only supports 1 argument:
 *     arr.some(f); // valid call with 1 argument
 *     arr.some(f, this); // unsupported call with 2 arguments
 */
export function createVisitor(every) {
	const methodName = every ? 'every' : 'some';
	return t => ({
		ExpressionStatement(path, state) {
			const expression = path.node.expression;
			if (!isIdAssignment(t, expression) ||
				!isMethodCall(t, expression.right, methodName) ||
				expression.right.arguments.length !== 1) {
				return;
			}

			const somePath = path.get('expression.right');
			const assignee = expression.left;

			// If the array is the assignee, we need a temp var to hold the array.
			const array = expression.right.callee.object;
			if (t.isIdentifier(array) && array.name === assignee.name) {
				somePath.get('callee.object').replaceWith(defineId(t, path, array, 'const', 'arr'));
			}

			const initAssignment = t.assignmentExpression('=', assignee, t.booleanLiteral(every));
			path.insertBefore(t.expressionStatement(initAssignment));

			path.replaceWith(forLoop(t, path, assignee, somePath, every));
		},

		VariableDeclaration(path, state) {
			if (path.node.declarations.length !== 1) return;

			const declaration = path.node.declarations[0];
			if (!isMethodCall(t, declaration.init, methodName) ||
				declaration.init.arguments.length !== 1) {
				return;
			}

			const assignee = declaration.id;
			const tempAssignee = defineId(t, path, t.booleanLiteral(every), 'let', 'temp');

			const somePath = path.get('declarations.0.init');
			path.insertBefore(forLoop(t, path, tempAssignee, somePath, every));
			somePath.replaceWith(tempAssignee);
		},
	});
}

function forLoop(t, path, assignee, somePath, every) {
	const array = defineIdIfNeeded(t, somePath.get('callee.object'), path);
	const func = extractDynamicFuncIfNeeded(t, somePath, path);
	const i = path.scope.generateUidIdentifier('i');

	let newSomeCall = t.callExpression(func, [t.memberExpression(array, i, true), i, array]);
	if (every) {
		newSomeCall = t.unaryExpression('!', newSomeCall);
	}
	const forBody = t.blockStatement([
		t.ifStatement(
			newSomeCall,
			t.blockStatement([
				t.expressionStatement(t.assignmentExpression('=', assignee, t.booleanLiteral(!every))),
				t.breakStatement(),
			])
		),
	]);

	return basicArrayForLoop(t, i, array, forBody);
}
