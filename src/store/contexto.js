import { createContext, useContext } from 'react'

export const AppContexto = createContext(null)

export const useApp = () => useContext(AppContexto)
