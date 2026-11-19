import { TwinterOptions } from './options';
import { getParentOfElementFromXPath } from './utilities';

export default class Twinter {


  constructor(private options: TwinterOptions) {
    console.log('Twinter initialized with options:', options);
    setTimeout(() => {
      this.setupObserver();
      this.loadPageSpecificFeatures(window.location.pathname);
    }, 3000);
  }

  private loadPageSpecificFeatures(urlPath: string) {
    switch(urlPath) {
      case '/home': {
        this.homeFeatures();
        break;
      }
      default: {}
    }
  }

  private homeFeatures() {
    const headerLinks = [...document.querySelectorAll("header a").values()];

    // removes the left bottom buttons (grok & DM) and the bottom banner
    document.querySelector("#layers")?.firstChild?.remove();

    if (!this.options.UI.premium) {
      headerLinks.find(link => link.getAttribute('aria-label') === 'Creator Studio')?.remove();
      headerLinks.find(link => link.getAttribute('aria-label') === 'Premium')?.remove();
      document.querySelector('aside[aria-label="Subscribe to Premium"]')?.parentElement?.remove();
    }

    if (!this.options.UI.live) {
      const container = getParentOfElementFromXPath('//span[text()="Live on X"]', 3);
      container?.remove();
    }

    if (!this.options.UI.grok) {
      headerLinks.find(link => link.getAttribute('aria-label') === 'Grok')?.remove();
    }
  }

  private setupObserver() {
    let currentUrlPath = window.location.pathname;
    const observer = new MutationObserver((mutations) => {
      const location = window.location.pathname;
      if (location !== currentUrlPath) {
        currentUrlPath = location;
        console.log('URL path changed to:', currentUrlPath);
        this.loadPageSpecificFeatures(currentUrlPath);
      }
    });
    observer.observe(document.querySelector('#react-root')!, { childList: true, subtree: true });
  }
}
