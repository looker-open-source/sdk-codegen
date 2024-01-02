import { LookerNodeSDK } from '@looker/sdk-node';
import { renderDot } from 'render-dot';
import * as fs from 'fs';

const sdk = LookerNodeSDK.init40();

// returns an svg file with the pdt dependency graph viz
const getPDTGraph = async (modelname: string, filename: string) => {
  if (modelname) {
    const res = await sdk.ok(
      sdk.graph_derived_tables_for_model({ model: modelname })
    );
    const result = await renderDot({
      input: res.graph_text,
      format: 'svg',
    });
    const file = fs.writeFileSync(filename, result, 'binary');
    return file;
  } else {
    throw Error(
      `Model name not specified, please specifiy a model name to pull pdt dependency graph for.`
    );
  }
};

// Example
//getPDTGraph('pdtgraph')
