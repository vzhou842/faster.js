/**
 * Checks whether an AST node is a method call on an identifier, e.g.:
 *     object.method(params);
 */
export function isMethodCall(t, node, method) {
	return t.isCallExpression(node) &&
		t.isMemberExpression(node.callee) &&
		// t.isIdentifier(node.callee.object) &&
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
	const forUpdate = t.updateExpression('++', i);

	return t.forStatement(forInit, forTest, forUpdate, body);
}

/**
 * Defines an identifier before the supplied path.
 *
 * @param path - The path before which to define the identifier.
 * @param value - The initial value of the identifier.
 * @param [type=let] - The declaration type (let or const).
 * @param [name=defined] - The identifier name.
 * @returns The identifier.
 */
export function defineId(t, path, value, type, name) {
	const id = path.scope.generateUidIdentifier(name || 'defined');
	path.insertBefore(t.VariableDeclaration(type || 'let', [
		t.VariableDeclarator(id, value),
	]));
	return id;
}

/**
 * Defines an AST node as an identifier if it isn't already one.
 *
 * @param path - The path to the AST node in question.
 * @param [insertPath=path] - The path at which to insert the new definition.
 * @returns The identifier.
 */
export function defineIdIfNeeded(t, path, insertPath) {
	let ret = path.node;
	if (!t.isIdentifier(path.node)) {
		ret = defineId(t, insertPath || path, path.node, 'const');
	}
	return ret;
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
		const fPath = path.get('arguments.0');
		ret = defineIdIfNeeded(t, fPath, insertPath || path);
		fPath.replaceWith(ret);
	}

	return ret;
}
