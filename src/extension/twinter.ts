import { TwinterOptions } from './options';

export default class Twinter {
  constructor(private options: TwinterOptions) {
    console.log('Twinter initialized with options:', options);
    setTimeout(() => this.initialize(), 3000)
  }

  private initialize() {
    const headerLinks = [...document.querySelectorAll("header a").values()];
    for (const linkElement of headerLinks) {
      console.log('Header link:', linkElement)
    }

    // removes the left bottom buttons (grok & DM) and the bottom banner
    document.querySelector("#layers")?.firstChild?.remove();

    if (!this.options.UI.premium) {
      headerLinks.find(link => link.getAttribute('aria-label') === 'Creator Studio')?.remove();
      headerLinks.find(link => link.getAttribute('aria-label') === 'Premium')?.remove();
      document.querySelector('aside[aria-label="Subscribe to Premium"]')?.remove();
    }

    if(!this.options.UI.live) {
      // Live on X
      const element
        = document.evaluate('//span[text()="Live on X"]', document, null, XPathResult.ANY_TYPE, null).iterateNext();
      let parent = element?.parentElement
      for (let i = 0; i < 3; i++) {
        parent = parent?.parentElement;
      }
      parent?.remove();
    }

    if(!this.options.UI.grok) {
      headerLinks.find(link => link.getAttribute('aria-label') === 'Grok')?.remove();
    }

  }
}
