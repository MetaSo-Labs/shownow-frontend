import _home from '@/assets/nav/house-line.svg'
import _homeActive from '@/assets/nav/house-line-active.svg'
import _follow from '@/assets/nav/square-user-check.svg'
import _followActive from '@/assets/nav/square-user-check-active.svg'
import _profile from '@/assets/nav/user-alt.svg'
import _profileActive from '@/assets/nav/user-alt-active.svg'
import _setting from '@/assets/nav/gear.svg'
import _settingActive from "@/assets/nav/gear-active.svg"
import { useLocation, history } from 'umi'
import { useEffect, useState } from 'react'
import { theme } from 'antd'
import LinearIcon from '@/Components/Icon'
import Trans from '@/Components/Trans'

export const menus = [
    { key: 'home', icon: _home, activeIcon: _homeActive, label: <Trans>Home</Trans> },
    { key: 'follow', icon: _follow, activeIcon: _followActive, label: <Trans>Follow</Trans> },
    { key: 'profile', icon: _profile, activeIcon: _profileActive, label: <Trans>Profile</Trans> },
    { key: 'setting', icon: _setting, activeIcon: _settingActive, label: <Trans>Setting</Trans> },
    { key: 'about', icon: _setting, activeIcon: _settingActive, label: <Trans>About</Trans> },
    { key: 'rank', icon: _setting, activeIcon: _settingActive, label: <Trans>Rank</Trans> },
]

export default () => {
    const location = useLocation();
    const path = location.pathname;
    const [curMenu, setCurMenu] = useState<string>('home');
    const { token: {
        colorPrimary,
        colorTextSecondary
    } } = theme.useToken()
    useEffect(() => {
        if (path === '/') {
            setCurMenu('home')
        } else {
            setCurMenu(path.split('/')[1])
        }

    }, [path])

    return <div className='menus'>
        {menus.map((item) => {
            return <div key={item.key} className={`item ${curMenu === item.key ? 'active' : ''}`} style={{
                color: curMenu === item.key ? colorPrimary : colorTextSecondary
            }} onClick={() => {
                setCurMenu(item.key)
                history.push(`/${item.key}`)
            }} >
                <LinearIcon name={item.key} color={curMenu === item.key ? colorPrimary : colorTextSecondary} />
                <span>{item.label}</span>
            </div>
        })
        }
    </div>
}