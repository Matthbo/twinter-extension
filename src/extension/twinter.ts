import { TwinterOptions } from './options';
import { getAncestorOfElement, getParentOfElementFromXPath } from './utilities';

export default class Twinter {
  constructor(private options: TwinterOptions) {
    console.log('Twinter initialized with options:', options);
    setTimeout(() => {
      this.setupObserver();
      this.loadPageSpecificFeatures(globalThis.location.pathname);
    }, 3000);
  }

  private loadPageSpecificFeatures(urlPath: string): void {
    switch (urlPath) {
      case '/home': {
        this.homeFeatures();
        break;
      }
      case '/compose/post': {
        this.loadComposeTweetFeatures();
        break;
      }
      default:
    }
  }

  private homeFeatures(): void {
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    const headerLinks = [...document.querySelectorAll('header a').values()];

    // removes the left bottom buttons (grok & DM) and the bottom banner
    document.querySelector('#layers')?.firstChild?.remove();
    headerLinks.find((link) => link.getAttribute('aria-label') === 'Calls')?.remove();

    if (!this.options.UI.premium) {
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Creator Studio')?.remove();
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Premium')?.remove();
      document.querySelector('aside[aria-label="Subscribe to Premium"]')?.parentElement?.remove();
    }

    if (!this.options.UI.live) {
      const container = getParentOfElementFromXPath('//span[text()="Live on X"]', 4);
      container?.remove();
    }

    // eslint-disable-next-line unicorn/prefer-early-return
    if (!this.options.UI.grok) {
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Grok')?.remove();
      const grokButton = document.querySelector('button[aria-label="Generate image"]');
      if (grokButton) getAncestorOfElement(grokButton, 3)?.remove();
    }
  }

  private loadComposeTweetFeatures(): void {
    const container = document.querySelector('[aria-labelledby="modal-header"][aria-modal="true"]');
    if (!container || this.options.UI.grok) return;

    const intervalId = setInterval(() => {
      const grokButton = container.querySelector('button[aria-label="Generate image"]');
      console.debug('grok button', grokButton);
      if (!grokButton) return;
      clearInterval(intervalId);
      getAncestorOfElement(grokButton, 3)?.remove();
    });
  }

  private processTweets(): void {
    if (this.options.UI.grok) return;

    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    const tweets = [...document.querySelectorAll('article[role="article"]').values()].filter(
      (tweet) => !tweet.classList.contains('cleaned'),
    );
    console.debug('Cleaning up Grok buttons for', tweets.length, 'tweets');
    for (const tweet of tweets) {
      const grokButton = tweet.querySelector('button[aria-label="Grok actions"]')?.parentElement;
      if (!grokButton) continue;

      grokButton.remove();
      tweet.classList.add('cleaned');
    }
  }

  private setupObserver(): void {
    let currentUrlPath = globalThis.location.pathname;
    const observer = new MutationObserver((_) => {
      this.processTweets();

      const location = globalThis.location.pathname;
      if (location === currentUrlPath) return;

      currentUrlPath = location;
      console.log('URL path changed to:', currentUrlPath);
      this.loadPageSpecificFeatures(currentUrlPath);
    });
    observer.observe(document.querySelector('#react-root')!, { childList: true, subtree: true });
  }
}
