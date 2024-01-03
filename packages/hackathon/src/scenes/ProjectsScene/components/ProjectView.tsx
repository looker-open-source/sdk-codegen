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

import type { FC } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import { ExtMarkdown } from '@looker/extension-utils';
import { getExtensionSDK } from '@looker/extension-sdk';
import type { IProjectProps } from '../../../models';
import { getTechnologies } from '../../../data/hack_session/selectors';
import { getMembers, techDescriptions } from '../../utils';

type ProjectViewProps = Pick<
  IProjectProps,
  | 'description'
  | 'technologies'
  | 'members'
  | 'title'
  | 'project_type'
  | 'contestant'
>;

export const ProjectView: FC<ProjectViewProps> = ({
  description,
  technologies,
  members,
  title,
  project_type,
  contestant,
}) => {
  const onClick = (_: string, href: string) =>
    getExtensionSDK().openBrowserWindow(href);

  const availableTechnologies = useSelector(getTechnologies);
  const view = `# ${title}

${description}

**Team members**: ${getMembers(members)} 

**Uses**: ${techDescriptions(technologies, availableTechnologies)}

**Project type**: ${project_type}

**Contestant**: ${contestant ? 'Yes' : 'No'}
`;
  return <ExtMarkdown source={view} linkClickHandler={onClick} />;
};
