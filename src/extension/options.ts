
export type TwinterOptions = {
  primaryColour: string;
  accentColour: string;
  renameGrok: boolean;
  cleanUrls: boolean;
  UI: {
    premium: boolean;
    hideGrok: boolean;
    news: boolean;
    trending: boolean; // What’s happening
    whoToFollow: boolean;
  }
  filters: {
    checkmarkUsers: boolean;
    phobes: boolean;
  }
}

const options: TwinterOptions = {
  primaryColour: '#901444',
  accentColour: '#916fca',
  renameGrok: true,
  cleanUrls: true,
  UI: {
    premium: false,
    hideGrok: true,
    news: true,
    trending: true,
    whoToFollow: true
  },
  filters: {
    checkmarkUsers: false,
    phobes: false
  }
};

export default options;
