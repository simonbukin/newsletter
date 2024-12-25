import { HLTVAggregator } from "./aggregators/hltv";

async function generateNewsletter() {
  const hltvAggregator = new HLTVAggregator();

  try {
    await hltvAggregator.initialize();
    const hltvContent = await hltvAggregator.getContent();
  } finally {
    await hltvAggregator.close();
  }
}
