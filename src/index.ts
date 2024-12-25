import { HackerNewsAggregator } from "./aggregators/hackernews";
import { HLTVAggregator } from "./aggregators/hltv";
import { VLRAggregator } from "./aggregators/vlr";

async function generateNewsletter() {
  const hltvAggregator = new HLTVAggregator();
  const vlrAggregator = new VLRAggregator();
  const hackernewsAggregator = new HackerNewsAggregator();

  try {
    await hltvAggregator.initialize();
    await vlrAggregator.initialize();

    const hltvContent = await hltvAggregator.getContent();
    const vlrContent = await vlrAggregator.getContent();
    const hackernewsContent = await hackernewsAggregator.getContent();
  } finally {
    await hltvAggregator.close();
    await vlrAggregator.close();
  }
}
