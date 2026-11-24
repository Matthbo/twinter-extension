import { TwinterOptions } from './options';
import { getAncestorOfElement, getParentOfElementFromXPath, waitTillElementExists } from './utilities';

export default class Twinter {
  constructor(private options: TwinterOptions) {
    console.debug('Twinter initialized with options:', options);
    this.clearServerRenderedContent();
    waitTillElementExists('main', () => {
      this.setupObserver();
      this.loadApplication();
    });
  }

  private loadApplication(): void {
    waitTillElementExists('nav a', () => this.updateHeader());
    waitTillElementExists('aside', () => this.updateSidebar());
    waitTillElementExists('[data-slot="xds-dock"]', (layersElement) => layersElement.remove());
    waitTillElementExists('main', () => this.loadPageSpecificFeatures(globalThis.location.pathname));

    window.addEventListener('resize', () =>
      setTimeout(() => {
        this.updateHeader();
      }, 50),
    );

    this.updateTitle();
  }

  private updateHeader(): void {
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    const headerLinks = [...document.querySelectorAll('nav a').values()];
    headerLinks.find((link) => link.getAttribute('aria-label') === 'Calls')?.remove();

    if (!this.options.UI.premium) {
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Creator Studio')?.remove();
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Premium')?.remove();
    }

    if (!this.options.UI.grok) {
      headerLinks.find((link) => link.getAttribute('aria-label') === 'Grok')?.remove();
    }
  }

  private updateSidebar(): void {
    console.debug('Updating sidebar');
    if (!this.options.UI.premium) {
      const premiumTextElement = document.querySelector('aside[aria-label="Subscribe to Premium"]');
      if (premiumTextElement) getAncestorOfElement(premiumTextElement, 2)?.remove();
    }

    if (!this.options.UI.live) {
      const container = getParentOfElementFromXPath('//span[text()="Live on X"]', 4);
      container?.remove();
    }

    if (!this.options.UI.news) {
      const container = getParentOfElementFromXPath('//span[text()="Today’s News"]', 4);
      container?.remove();
    }

    if (!this.options.UI.trending) {
      const trendingTextElement = document.querySelector('[aria-label="Timeline: Trending now"]');
      if (trendingTextElement) getAncestorOfElement(trendingTextElement, 2)?.remove();
    }

    // eslint-disable-next-line unicorn/prefer-early-return
    if (!this.options.UI.whoToFollow) {
      const followTextElement = document.querySelector('aside[aria-label="Who to follow"]');
      if (followTextElement) getAncestorOfElement(followTextElement, 2)?.remove();
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
    waitTillElementExists('main form', (composeForm) => {
      composeForm.querySelector('button[aria-label="Generate image"]')?.parentElement?.remove();
    });
  }

  private loadComposeTweetFeatures(): void {
    const container = document.querySelector('[data-slot="xds-modal-surface"]');
    if (!container || this.options.UI.grok) return;

    waitTillElementExists(
      'button[aria-label="Generate image"]',
      (grokButton) => grokButton.parentElement?.remove(),
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
    const pageObserver = new MutationObserver((_) => {
      const location = globalThis.location.pathname;
      if (location === currentUrlPath) return;

      currentUrlPath = location;
      console.debug('URL path changed to:', currentUrlPath);
      this.loadPageSpecificFeatures(currentUrlPath);
      this.updateSidebar();
      this.updateTitle();
    });
    pageObserver.observe(document.querySelector('body')!, { childList: true, subtree: true });

    const mainObserver = new MutationObserver((_) => this.processTweets());
    mainObserver.observe(document.querySelector('main')!, { childList: true, subtree: true });
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

  private clearServerRenderedContent(): void {
    console.log('black out?', document.querySelector('template[data-dgst]') != null);
    if (document.querySelector('template[data-dgst]') == null) return;
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    const divs = [...document.body.childNodes.values()].filter((node) => node.nodeName === 'DIV');
    for (const div of divs) div.remove();
  }
}
