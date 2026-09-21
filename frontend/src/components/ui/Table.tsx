import type { ReactNode } from 'react'

interface TableWrapProps {
  head: ReactNode
  children: ReactNode
}

export function Table({ head, children }: TableWrapProps) {
  return (
    <div className="table-wrap">
      <table className="w-full border-collapse">
        <thead className="border-b border-hairline bg-surfaceHover/60">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-hairline">{children}</tbody>
      </table>
    </div>
  )
}
