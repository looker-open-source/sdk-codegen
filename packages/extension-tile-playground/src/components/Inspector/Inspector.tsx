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
import React from 'react';
import { SpaceVertical, Box2 } from '@looker/components';
import { DashboardGauge } from '@looker/icons';
import { Layout } from '../Layout';
import { NavigateButton } from '../NavigateButton';
import { EventTester } from './components/EventTester';
import { TileHostData } from './components/TileHostData';
import { VisualizationData } from './components/VisualizationData';

export const Inspector: React.FC = () => {
  return (
    <Layout right={<NavigateButton path="/" icon={<DashboardGauge />} />}>
      <SpaceVertical gap="small">
        <Box2 width="100%">
          <TileHostData />
        </Box2>
        <Box2 width="100%">
          <EventTester />
        </Box2>
        <Box2 width="100%">
          <VisualizationData />
        </Box2>
      </SpaceVertical>
    </Layout>
  );
};
