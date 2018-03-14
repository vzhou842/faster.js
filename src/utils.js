export function isIdMethodCall(t, node, method) {
	return t.isCallExpression(node) &&
		t.isMemberExpression(node.callee) &&
		t.isIdentifier(node.callee.object) &&
		node.callee.property.name === method;
}

/**
 * Creates an AST for a for loop of the following form:
 * for (let i = 0; i < array.length; i++) { body }
 */
export function basicArrayForLoop(t, i, array, body) {
	const forInit = t.VariableDeclaration("let", [
		t.VariableDeclarator(i, t.numericLiteral(0)),
	]);
	const forTest = t.binaryExpression('<', i, t.memberExpression(array, t.identifier('length')));
	const forUpdate = t.unaryExpression('++', i, false);

	return t.forStatement(forInit, forTest, forUpdate, body);
}