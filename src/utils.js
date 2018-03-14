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
