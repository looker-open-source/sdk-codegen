/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import React from 'react'
import { ComponentsProvider, Space, Text } from '@looker/components'

// import { Button, ComponentsProvider, Space, Text } from '@looker/components'
// import { ExtensionContext } from '@looker/extension-sdk-react'

/**
 * Playground for testing extension SDK functionality.
 * Changes are not expected to be kept and may be thrown
 * away at anytime. Keep this simple.
 */
export const Playground: React.FC = () => {
  // const { extensionSDK } = useContext(ExtensionContext)

  // const onClipboardClick = () =>
  //   extensionSDK.clipboardWrite(
  //     `伝開ユオヤ前刻むけト休表日ウシスト掲類カイモヨ任3書トヱム味社ム一首分のル社変へらや稿働クノヒタ振会今ー法科太せぜすづ。差キケリカ沈在ヤリ覧打ぱばい次宅ヒレ重暮サ敬思カナ受関ぴ全遠ぶト考著らよ岡火ネ田技龍政クレぴざ着投べほ照54中消でじきょ朝苦なふのぼ。能ぜむさ及人がずみし提村よならに読公分ド体41本モキネ高浦国むらかフ動規ず藤井ノキサ部形浩ッぎな。`
  //   )

  return (
    <ComponentsProvider>
      <Space p="xxxxxlarge" width="100%" height="50vh" around>
        <Text p="xxxxxlarge" fontSize="xxxxxlarge">
          Welcome to the Playground
        </Text>
        {/* <Button onClick={onClipboardClick}>Write text to clipboard</Button> */}
      </Space>
    </ComponentsProvider>
  )
}
