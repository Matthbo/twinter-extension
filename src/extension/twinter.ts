import { TwinterOptions } from './options';
import { getAncestorOfElement, getParentOfElementFromXPath, waitTillElementExists } from './utilities';

export default class Twinter {
  constructor(private options: TwinterOptions) {
    waitTillElementExists('h1', () => {
      console.debug('Twinter initialized with options:', options);
      this.setupObserver();
      this.loadApplication();
    });
  }

  private loadApplication(): void {
    waitTillElementExists('#layers', (layersElement) => {
      // removes the left bottom buttons (grok & DM)
      const lbButtonsLayers = layersElement.firstChild;
      if (!lbButtonsLayers || lbButtonsLayers.childNodes.length < 2) return;

      // twice because there are two buttons
      lbButtonsLayers.firstChild?.remove();
      lbButtonsLayers.firstChild?.remove();
    });

    waitTillElementExists('header a', () => this.updateHeader());
    waitTillElementExists('[aria-label="Timeline: Trending now"]', () => this.updateSidebar());

    window.addEventListener('resize', () =>
      setTimeout(() => {
        this.updateHeader();
      }, 50),
    );

    this.updateTitle();
    this.loadPageSpecificFeatures(globalThis.location.pathname);
  }

  private updateHeader(): void {
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    const headerLinks = [...document.querySelectorAll('header a').values()];
    headerLinks.find((link) => link.getAttribute('aria-label') === 'Calls')?.remove();

    if (!this.options.UI.premium) {
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Creator Studio')?.remove();
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Premium')?.remove();

      // cope
      waitTillElementExists('header a[aria-label="Creator Studio"]', (element) => element.remove());
    }

    if (!this.options.UI.grok) {
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Grok')?.remove();
    }
  }

  private updateSidebar(): void {
    console.debug('Updating sidebar');
    if (!this.options.UI.premium)
      document.querySelector('aside[aria-label="Subscribe to Premium"]')?.parentElement?.remove();

    // eslint-disable-next-line unicorn/prefer-early-return
    if (!this.options.UI.live) {
      const container = getParentOfElementFromXPath('//span[text()="Live on X"]', 4);
      container?.remove();
    }
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
    if (this.options.UI.grok) return;
    const grokButton = document.querySelector('button[aria-label="Generate image"]');
    if (grokButton) getAncestorOfElement(grokButton, 3)?.remove();
  }

  private loadComposeTweetFeatures(): void {
    const container = document.querySelector('[aria-labelledby="modal-header"][aria-modal="true"]');
    if (!container || this.options.UI.grok) return;

    waitTillElementExists(
      'button[aria-label="Generate image"]',
      (grokButton) => {
        getAncestorOfElement(grokButton, 3)?.remove();
      },
      container,
    );
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
      console.debug('URL path changed to:', currentUrlPath);
      this.loadPageSpecificFeatures(currentUrlPath);
      this.updateSidebar();
    });
    observer.observe(document.querySelector('#react-root')!, { childList: true, subtree: true });

    const titleObserver = new MutationObserver(() => this.updateTitle());
    titleObserver.observe(document.querySelector('title')!, { childList: true });
  }

  private updateTitle(): void {
    const title = document.title;
    console.log('Title:', title);
    if (title.endsWith('Twinter')) return;
    if (title === 'X') {
      document.title = 'Twinter';
      return;
    }
    document.title = title.replace('/ X', '/ Twinter');
  }
}
