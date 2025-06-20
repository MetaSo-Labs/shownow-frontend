import React, { useState, useRef, useEffect } from "react"

interface InfiniteScrollProps {
    id: string
    onMore: () => void
}

const InfiniteScrollV2: React.FC<InfiniteScrollProps> = ({ id, onMore }) => {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting)
                if (isIntersecting) onMore()
            },
            { threshold: 0 }
        )
        if (ref.current) observer.observe(ref.current)

        return () => {
            observer.disconnect()
        }
    }, [isIntersecting, onMore])

    return <div ref={ref} id={id} style={{ height: 20 }} />
}

export default InfiniteScrollV2