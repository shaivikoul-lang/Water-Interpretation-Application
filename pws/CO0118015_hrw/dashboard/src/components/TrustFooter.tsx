import { FileText } from 'lucide-react'

export function TrustFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200/80 py-10 text-left dark:border-slate-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <FileText className="h-4 w-4" />
            Trust & transparency
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This dashboard reads Colorado’s public drinking water dataset for one
            system (Highlands Ranch Water). It is not a laboratory test of water at
            your kitchen tap, not a compliance determination, and not affiliated with
            CDPHE or your utility.
          </p>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-200">Primary sources</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <a
                className="text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
                href="https://coepht.colorado.gov/public-drinking-water-data"
                target="_blank"
                rel="noreferrer"
              >
                Colorado EPHT — public drinking water data
              </a>
            </li>
            <li>
              <a
                className="text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
                href="https://cdphe.colorado.gov/dwinfo"
                target="_blank"
                rel="noreferrer"
              >
                CDPHE Drinking Water Information
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
