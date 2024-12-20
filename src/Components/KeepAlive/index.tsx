import React, { ReactNode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface KeepAliveProps {
    children: ReactNode;
    active: boolean; // 是否激活当前组件
}

const containerRef: HTMLDivElement = document.createElement('div')

const KeepAlive: React.FC<KeepAliveProps> = ({ children, active }) => {
    const pageRef = useRef<HTMLDivElement | null>(null);

    const [portal, setPortal] = useState<React.ReactPortal | null>(null);



    useEffect(() => {

        if (containerRef.getElementsByClassName('infinite-scroll-component__outerdiv').length === 0) {
            setPortal(ReactDOM.createPortal(children, containerRef))
            pageRef.current?.appendChild(containerRef);
        }
        console.log(containerRef.getElementsByClassName('ant-list').length)

    }, [children]);
    console.log(containerRef.getElementsByClassName('infinite-scroll-component__outerdiv').length,'containerRef')

    return (
        <>
          
            {portal}
            <div style={{ display: active ? 'block' : 'none' }} ref={pageRef}>
                
            </div>
        </>
    );
};

export default KeepAlive;
