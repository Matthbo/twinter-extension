export function getParentOfElementFromXPath(xpathExpression: string, ancestorLevels : number): HTMLElement | null {
  const node
    = document.evaluate(xpathExpression, document, null, XPathResult.ANY_TYPE, null).iterateNext();
  let parent = node?.parentElement;
  for (let i = 0; i < ancestorLevels ; i++) {
    if (!parent) break;
    parent = parent?.parentElement;
  }
  return parent ?? null;
}
