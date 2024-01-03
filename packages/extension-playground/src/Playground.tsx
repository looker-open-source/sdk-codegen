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
import React, { useContext, useEffect, useState } from 'react';
import { ComponentsProvider, SpaceVertical, Span } from '@looker/components';
import { ExtensionContext40 } from '@looker/extension-sdk-react';

/**
 * Playground for testing extension SDK functionality.
 * Changes are not expected to be kept and may be thrown
 * away at anytime. Keep this simple.
 */
export const Playground = () => {
  const { coreSDK } = useContext(ExtensionContext40);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getMe = async () => {
      try {
        const me = await coreSDK.ok(coreSDK.me());
        setMessage(`Hello, ${me.display_name}`);
      } catch (error) {
        console.error(error);
        setMessage('An error occurred while getting information about me!');
      }
    };
    getMe();
  }, [coreSDK]);

  return (
    <ComponentsProvider>
      <SpaceVertical
        p="xxxxxlarge"
        width="100%"
        height="90vh"
        justifyItems="center"
        align="center"
      >
        <Span p="xxxxxlarge" fontSize="xxxxxlarge">
          Welcome to the Playground
        </Span>
        <Span p="xxxxxlarge" fontSize="xxxxxlarge">
          <Span fontSize="xxxxxlarge">{message}</Span>
        </Span>
      </SpaceVertical>
    </ComponentsProvider>
  );
};
