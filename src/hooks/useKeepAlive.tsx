import React, { useRef, createContext, useContext, useMemo, useEffect, Suspense } from 'react';
import { useOutlet } from 'react-router-dom'
import { Outlet, useLocation, matchPath } from 'umi'
import type { FC } from 'react';
export const KeepAliveContext = createContext<KeepAliveLayoutProps>({ keepalive: [], keepElements: {} });

const isKeepPath = (aliveList: any[], path: string) => {
    let isKeep = false;
    aliveList.map(item => {
        if (item === path) {
            isKeep = true;
        }
        if (item instanceof RegExp && item.test(path)) {
            isKeep = true;
        }
        if (typeof item === 'string' && item.toLowerCase() === path) {
            isKeep = true;
        }
    })
    return isKeep;
}

function KeepOutlet(props: any): React.ReactElement | null {
    const element = useOutlet()
    return <Suspense fallback={<div>Loading...</div>}>
        {element}
    </Suspense>
}

export function useKeepOutlets() {

    const location = useLocation();
    const element = <Suspense fallback={<div>Loading...</div>}>
        {useOutlet()}
    </Suspense>
    const notKeepEle = <Outlet />
    const { keepElements, keepalive } = useContext<any>(KeepAliveContext);
    const isKeep = isKeepPath(keepalive, location.pathname);

    if (isKeep) {
        keepElements.current[location.pathname] = element;
    }
    console.log(React.isValidElement(element), element,isKeep)

    const keepAliveArr = Object.entries(keepElements.current)
    return <>
        {
            keepAliveArr.map(([pathname, element]: any) => (
                <div key={pathname} style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden auto' }} className={"rumtime-keep-alive-layout " + pathname} hidden={!matchPath(location.pathname, pathname)}>
                    {element}
                </div>
            ))
        }
        <div hidden={isKeep} style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden auto' }} className="rumtime-keep-alive-layout-no">
            <Outlet />
        </div>
    </>
}

interface KeepAliveLayoutProps {
    keepalive: any[];
    keepElements?: any;
    dropByCacheKey?: (path: string) => void;
}

const KeepAliveLayout: FC<KeepAliveLayoutProps> = (props) => {
    const { keepalive, ...other } = props;
    const keepElements = React.useRef<any>({})
    function dropByCacheKey(path: string) {
        keepElements.current[path] = null;
    }
    return (
        <KeepAliveContext.Provider value={{ keepalive, keepElements, dropByCacheKey }} {...other} />
    )
}

export default KeepAliveLayout;