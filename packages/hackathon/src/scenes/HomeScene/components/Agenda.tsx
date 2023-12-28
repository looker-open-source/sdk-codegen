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

import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import type { IHackerProps } from '../../../models';
import type { AgendaItems, IAgendaEras } from '.';
import { AgendaEra, Era, agendaEras } from '.';

interface AgendaProps {
  schedule: AgendaItems;
  hacker: IHackerProps;
}

export const Agenda: FC<AgendaProps> = ({ schedule, hacker }) => {
  const [eras, setEras] = useState<IAgendaEras>(() => agendaEras(schedule));
  const [defaultEra, setDefaultEra] = useState<string>(Era.present);

  const calcDefaultEra = (newEras: IAgendaEras) => {
    setEras(newEras);
    if (newEras.present.length > 0) {
      setDefaultEra(Era.present);
    } else if (newEras.future.length > 0) {
      setDefaultEra(Era.future);
    } else {
      setDefaultEra(Era.past);
    }
  };

  useEffect(() => {
    calcDefaultEra(agendaEras(schedule));
  }, [schedule, hacker]);

  // TODO resurrect this after figuring out EF issues
  // useEffect(() => {
  //   const interval = setInterval(
  //     () => calcDefaultEras(agendaEras(schedule, hacker.timezone)),
  //     5 * 1000
  //   )
  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [])

  return (
    <>
      {Object.keys(eras).map((era) => (
        <AgendaEra
          era={era}
          key={era}
          agenda={eras[era]}
          hacker={hacker}
          defaultOpen={era === defaultEra}
        />
      ))}
    </>
  );
};
