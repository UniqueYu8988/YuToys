import { createContext } from 'react'

export const PreviewContext = createContext<(src: string | null) => void>(() => {})
