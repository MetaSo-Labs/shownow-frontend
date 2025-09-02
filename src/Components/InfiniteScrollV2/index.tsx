import React, { useRef, useEffect, useCallback } from "react"

interface InfiniteScrollProps {
    id: string
    onMore: () => void
}

const InfiniteScrollV2: React.FC<InfiniteScrollProps> = ({ id, onMore }) => {
    const ref = useRef<HTMLDivElement>(null)
    const isLoadingRef = useRef(false)

    // 使用 useCallback 缓存 onMore 函数，避免不必要的重新创建 observer
    const memoizedOnMore = useCallback(onMore, [onMore])

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // 只有当元素进入视口且当前没有在加载时才触发
                if (entry.isIntersecting && !isLoadingRef.current) {
                    isLoadingRef.current = true
                    memoizedOnMore()
                    
                    // 设置一个短暂的延迟来防止重复触发
                    setTimeout(() => {
                        isLoadingRef.current = false
                    }, 500)
                }
            },
            { 
                threshold: 0.1, // 增加阈值，确保元素真正进入视口
                rootMargin: '100px' // 提前100px开始加载
            }
        )
        
        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [memoizedOnMore]) // 只依赖 memoizedOnMore

    return <div ref={ref} id={id} style={{ height: 20 }} />
}

export default InfiniteScrollV2