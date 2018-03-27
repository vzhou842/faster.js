import {
	isIdAssignment,
	isIdMethodCall,
	basicArrayForLoop,
	extractDynamicFuncIfNeeded,
} from '../utils';

/**
 * Returns a visitor that rewrites array.reduce() calls as a for loop.
 *
 * Only supports calls on identifiers:
 *     array.reduce(f); // called on identifier 'array'
 *     [1, 2].reduce(f); // not called on an identifier
 *
 * Only supports assignments and single declarations:
 *     results = arr.reduce(f); // assignment
 *     const results = arr.reduce(f); // single declaration
 */
export default function(t) {
	return {
		ExpressionStatement(path, state) {
			const expression = path.node.expression;
			if (!isIdAssignment(t, expression) ||
				!isIdMethodCall(t, expression.right, 'reduce')) {
				return;
			}

			const assignee = expression.left;

			const acc = writeReduceForLoop(t, path, path.get('expression.right'));
			path.replaceWith(t.assignmentExpression('=', assignee, acc));
		},

		VariableDeclaration(path, state) {
			if (path.node.declarations.length !== 1) return;

			if (!isIdMethodCall(t, path.node.declarations[0].init, 'reduce')) {
				return;
			}

			const reducePath = path.get('declarations.0.init');
			const acc = writeReduceForLoop(t, path, reducePath);
			reducePath.replaceWith(acc);
		},
	};
}

// Returns the identifier the result is stored in.
function writeReduceForLoop(t, path, reducePath) {
	const reduceCall = reducePath.node;
	const array = reduceCall.callee.object;
	const func = extractDynamicFuncIfNeeded(t, reducePath, path);
	const acc = path.scope.generateUidIdentifier('acc');
	const i = path.scope.generateUidIdentifier('i');

	// Initialize the accumulator.
	// let acc = arguments[1] || arr[0];
	const initVal = reduceCall.arguments[1] || t.memberExpression(array, t.numericLiteral(0), true);
	path.insertBefore(t.VariableDeclaration('let', [
		t.VariableDeclarator(acc, initVal),
	]));

	// Write the for loop.
	const newReduceCall = t.callExpression(func, [
		acc,
		t.memberExpression(array, i, true),
		i,
		array,
	]);
	const forBody = t.blockStatement([
		t.expressionStatement(
			t.assignmentExpression('=', acc, newReduceCall)
		),
	]);
	const initI = reduceCall.arguments[1] ? undefined : t.numericLiteral(1);
	path.insertBefore(basicArrayForLoop(t, i, array, forBody, initI));

	return acc;
}
