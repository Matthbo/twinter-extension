export function getParentOfElementFromXPath(xpathExpression: string, ancestorLevels: number): HTMLElement | null {
  const node = document.evaluate(xpathExpression, document, null, XPathResult.ANY_TYPE, null).iterateNext();
  let parent = node?.parentElement;
  for (let index = 0; index < ancestorLevels; index++) {
    if (!parent) break;
    parent = parent?.parentElement;
  }
  return parent ?? null;
}
