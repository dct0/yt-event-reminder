import { Innertube, UniversalCache } from 'youtubei.js/cf-worker';

let yt: Innertube;

export const getYt = async () => {
  if (yt) return yt;

  const cache = new UniversalCache(true);
  yt = await Innertube.create({ cache });

  return yt;
};
