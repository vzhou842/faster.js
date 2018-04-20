/**
 * Returns a certain index of an array:
 *     return fromBack ? array.length - 1 - offset : offset;
 */
export function arrayIndex(t, array, offset, fromBack) {
	if (fromBack) {
		return t.binaryExpression(
			'-',
			t.memberExpression(array, t.identifier('length')),
			t.numericLiteral(offset + 1)
		);
	}
	return t.numericLiteral(offset);
}

/**
 * Returns a certain member of an array:
 *     return array[arrayIndex(array, offset, fromBack)];
 */
export function arrayMember(t, array, offset, fromBack) {
	return t.memberExpression(array, arrayIndex(t, array, offset, fromBack), true);
}

/**
 * Checks whether an AST node is a method call on an identifier, e.g.:
 *     object.method(params);
 */
export function isMethodCall(t, node, method) {
	return t.isCallExpression(node) &&
		t.isMemberExpression(node.callee) &&
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
 *     for (let i = init || 0; i <= array.length - 1; i++) { body }
 *
 * If backwards is specified, the for loop is instead:
 *     for (let i = init || array.length - 1; i >= 0; i--) { body }
 *
 * @param [backwards=false] - Whether or not to loop backwards.
 * @param {number} [init=0] - The initial value for i.
 */
export function basicArrayForLoop(t, i, array, body, backwards, init) {
	const forInit = t.VariableDeclaration("let", [
		t.VariableDeclarator(i, init || arrayIndex(t, array, 0, backwards)),
	]);
	const forTest = t.binaryExpression(backwards ? '>=' : '<=', i, arrayIndex(t, array, 0, !backwards));
	const forUpdate = t.updateExpression(backwards ? '--' : '++', i);

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
