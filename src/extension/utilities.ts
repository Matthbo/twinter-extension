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

export function waitTillElementExists(
  selector: string,
  callback: (element: Element) => void,
  container?: Element,
): void {
  const containerElement = container ?? document;
  const intervalId = setInterval(() => {
    const element = containerElement.querySelector(selector);
    if (!element) return;

    clearInterval(intervalId);
    callback(element);
  }, 10);
}
