import {
	arrayIndex,
	arrayMember,
	isIdAssignment,
	isMethodCall,
	basicArrayForLoop,
	defineIdIfNeeded,
	extractDynamicFuncIfNeeded,
} from '../utils';

export default createReduceVisitor(false);

/**
 * Returns a function that returns a visitor that rewrites
 * array.reduce() or array.reduceRight() calls as for loops.
 *
 * Only supports assignments and single declarations:
 *     results = arr.reduce(f); // assignment
 *     const results = arr.reduce(f); // single declaration
 */
export function createReduceVisitor(reduceRight) {
	const methodName = reduceRight ? 'reduceRight' : 'reduce';
	return t => ({
		ExpressionStatement(path, state) {
			const expression = path.node.expression;
			if (!isIdAssignment(t, expression) ||
				!isMethodCall(t, expression.right, methodName)) {
				return;
			}

			const assignee = expression.left;

			const acc = writeReduceForLoop(t, path, path.get('expression.right'), reduceRight);
			path.replaceWith(t.assignmentExpression('=', assignee, acc));
		},

		VariableDeclaration(path, state) {
			if (path.node.declarations.length !== 1) return;

			if (!isMethodCall(t, path.node.declarations[0].init, methodName)) {
				return;
			}

			const reducePath = path.get('declarations.0.init');
			const acc = writeReduceForLoop(t, path, reducePath, reduceRight);
			reducePath.replaceWith(acc);
		},
	});
}

// Returns the identifier the result is stored in.
function writeReduceForLoop(t, path, reducePath, reduceRight) {
	const reduceCall = reducePath.node;
	const array = defineIdIfNeeded(t, reducePath.get('callee.object'), path);
	const func = extractDynamicFuncIfNeeded(t, reducePath, path);
	const acc = path.scope.generateUidIdentifier('acc');
	const i = path.scope.generateUidIdentifier('i');

	// Initialize the accumulator.
	// let acc = arguments[1] || (reduceRight ? arr[arr.length - 1] : arr[0]);
	const initVal = reduceCall.arguments[1] || arrayMember(t, array, 0, reduceRight);
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
	let initI;
	if (!reduceCall.arguments[1]) {
		initI = reduceRight ? arrayIndex(t, array, 1, true) : t.numericLiteral(1);
	}
	path.insertBefore(basicArrayForLoop(t, i, array, forBody, reduceRight, initI));

	return acc;
}
