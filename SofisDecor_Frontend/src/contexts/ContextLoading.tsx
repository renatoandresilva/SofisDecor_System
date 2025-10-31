import { createContext, ReactNode, useState } from 'react'

type OnLoadingProvider = {
    children: ReactNode
}

type OnLoadingData = {
    context: boolean;
    changeContext: (value: boolean) => void
}

export const ContextOnLoading = createContext({} as OnLoadingData)

const LoadingProvider = ({ children }: OnLoadingProvider) => {
    const [context, setContext] = useState(false)

    const changeContext = (value: boolean) => {
        setContext(value)
    }

    return (
        <ContextOnLoading.Provider value={{ context, changeContext }}>
            {children}
        </ContextOnLoading.Provider>
    )
}

export default LoadingProvider