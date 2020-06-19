import { IMarker } from 'react-ace'

export const highlightSourceCode = (
  pattern: string,
  content: string,
  className = 'codeMarker'
): IMarker[] => {
  const result: IMarker[] = []
  if (pattern) {
    const lines = content.split('\n')
    const target = new RegExp(pattern, 'gi')
    lines.forEach((line, index) => {
      let found
      while ((found = target.exec(line))) {
        const mark: IMarker = {
          className,
          endCol: found.index + found[0].length,
          endRow: index,
          startCol: found.index,
          startRow: index,
          type: 'text',
        }
        result.push(mark)
      }
    })
  }
  return result
}
