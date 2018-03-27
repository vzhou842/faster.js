/**
 * Checks whether an AST node is a method call on an identifier, e.g.:
 *     object.method(params);
 */
export function isIdMethodCall(t, node, method) {
	return t.isCallExpression(node) &&
		t.isMemberExpression(node.callee) &&
		t.isIdentifier(node.callee.object) &&
		node.callee.property.name === method;
}

/**
 * Checks whether an AST node is an identifier assignment, e.g.:
 *     let variable = 'value';
 */
export function isIdAssignment(t, node) {
	return t.isAssignmentExpression(node) &&
		t.isIdentifier(node.left) &&
		node.operator === '=';
}

/**
 * Creates an AST for a for loop of the following form:
 *     for (let i = init || 0; i < array.length; i++) { body }
 *
 * @param {number} [init=0] - The initial value for i.
 */
export function basicArrayForLoop(t, i, array, body, init) {
	const forInit = t.VariableDeclaration("let", [
		t.VariableDeclarator(i, init || t.numericLiteral(0)),
	]);
	const forTest = t.binaryExpression('<', i, t.memberExpression(array, t.identifier('length')));
	const forUpdate = t.unaryExpression('++', i, false);

	return t.forStatement(forInit, forTest, forUpdate, body);
}

/**
 * Rewrites a method call using an arrow function or anonymous function
 * so that the function is defined first, if necessary.
 *
 * Before:
 *     let x = object.map(e => 2 * e);
 *
 * After:
 *     const func = e => 2 * e;
 *     let x = object.map(func);
 *
 * @param path - The path to the method call whose first argument is a function.
 * @param [insertPath=path] - The path at which to insert the extracted function declaration.
 * @returns The function identifier, regardless of whether a rewrite occurred.
 */
export function extractDynamicFuncIfNeeded(t, path, insertPath) {
	const f = path.node.arguments[0];
	let ret = f;

	if (t.isArrowFunctionExpression(f) || t.isFunctionExpression(f)) {
		ret = path.scope.generateUidIdentifier('f');
		(insertPath || path).insertBefore(t.VariableDeclaration('const', [
			t.VariableDeclarator(ret, f),
		]));
		path.get('arguments.0').replaceWith(ret);
	}

	return ret;
}
