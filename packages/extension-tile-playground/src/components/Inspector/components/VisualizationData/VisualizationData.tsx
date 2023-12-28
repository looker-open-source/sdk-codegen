/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import React, { useContext } from 'react';
import {
  Accordion2,
  Card,
  CardContent,
  Text,
  Box2,
  SpaceVertical,
} from '@looker/components';
import { ExtensionContext40 } from '@looker/extension-sdk-react';

export const VisualizationData: React.FC = () => {
  const { visualizationData, visualizationSDK } =
    useContext(ExtensionContext40);
  return (
    <>
      {!visualizationData ? (
        <Card width="100%">
          <CardContent>
            <Accordion2 label="Visualization data" defaultOpen>
              <Box2 mt="medium">
                <Text>Visualization data not available</Text>
              </Box2>
            </Accordion2>
          </CardContent>
        </Card>
      ) : (
        <SpaceVertical gap="small" width="100%">
          <Card width="100%">
            <CardContent>
              <Accordion2 label="Query response">
                <Box2 mt="medium">
                  <pre style={{ width: '300px' }}>
                    {JSON.stringify(visualizationSDK.queryResponse, null, 2)}
                  </pre>
                </Box2>
              </Accordion2>
            </CardContent>
          </Card>
          <Card width="100%">
            <CardContent>
              <Accordion2 label="Visualization configuration">
                <Box2 mt="medium">
                  <pre style={{ width: '300px' }}>
                    {JSON.stringify(visualizationSDK.visConfig, null, 2)}
                  </pre>
                </Box2>
              </Accordion2>
            </CardContent>
          </Card>
        </SpaceVertical>
      )}
    </>
  );
};
