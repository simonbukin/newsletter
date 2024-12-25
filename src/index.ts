import { HLTVAggregator } from "./aggregators/hltv";
import { VLRAggregator } from "./aggregators/vlr";

async function generateNewsletter() {
  const hltvAggregator = new HLTVAggregator();
  const vlrAggregator = new VLRAggregator();

  try {
    await hltvAggregator.initialize();
    await vlrAggregator.initialize();

    const hltvContent = await hltvAggregator.getContent();
    const vlrContent = await vlrAggregator.getContent();
  } finally {
    await hltvAggregator.close();
    await vlrAggregator.close();
  }
}
