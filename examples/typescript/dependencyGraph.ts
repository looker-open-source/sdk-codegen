import {LookerNodeSDK} from '@looker/sdk-node'
import {renderDot} from 'render-dot'
import * as fs from 'fs'


const sdk = LookerNodeSDK.init40()

// returns an svg file with the pdt dependency graph viz
const getPDTGraph = async(filename: string) => {
    const res = await sdk.ok(sdk.graph_derived_tables_for_model({model:'luka_thesis'}))
    console.log(res)

    const result = await renderDot({
        input: res.graph_text, 
        format: 'svg'
      })

    const file = fs.writeFileSync(filename, result, 'binary')

    return file
}

getPDTGraph('pdtgraph')