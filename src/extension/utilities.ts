export function getParentOfElementFromXPath(xpathExpression: string, ancestorLevels: number): HTMLElement | null {
  const node = document.evaluate(xpathExpression, document, null, XPathResult.ANY_TYPE, null).iterateNext();
  return node ? getAncestorOfElement(node, ancestorLevels) : null;
}

export function getAncestorOfElement(element: Node, ancestorLevels: number): HTMLElement | null {
  let parent = element?.parentElement;
  for (let index = 0; index < ancestorLevels - 1; index++) {
    if (!parent) break;
    parent = parent?.parentElement;
  }
  return parent ?? null;
}
