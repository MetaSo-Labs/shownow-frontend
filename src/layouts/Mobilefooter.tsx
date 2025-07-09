import _home from '@/assets/nav/house-line.svg'
import _homeActive from '@/assets/nav/house-line-active.svg'
import _follow from '@/assets/nav/square-user-check.svg'
import _followActive from '@/assets/nav/square-user-check-active.svg'
import _profile from '@/assets/nav/user-alt.svg'
import _profileActive from '@/assets/nav/user-alt-active.svg'
import _setting from '@/assets/nav/gear.svg'
import _settingActive from "@/assets/nav/gear-active.svg"
import { useLocation, history, useModel } from 'umi'
import { useEffect, useState } from 'react'
import { Badge, Dropdown, theme } from 'antd'
import LinearIcon from '@/Components/Icon'
import { menus } from './Menus'
import { EllipsisOutlined } from '@ant-design/icons'
import Trans from '@/Components/Trans'



export default () => {
    const { unreadNotificationCount } = useModel('user');
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

    return <div className='tabFooter'>
        {menus.slice(0, 4).map((item) => {
            return <div key={item.key} className={`item ${curMenu === item.key ? 'active' : ''}`} style={{
                color: curMenu === item.key ? colorPrimary : '#333'
            }} onClick={() => {
                setCurMenu(item.key)
                history.push(`/${item.key}`)
            }} >
                {item.key === 'notification' ? <Badge count={unreadNotificationCount}>
                    <LinearIcon name={item.key} color={curMenu === item.key ? colorPrimary : colorTextSecondary} />
                </Badge> : <LinearIcon name={item.key} color={curMenu === item.key ? colorPrimary : colorTextSecondary} />}




                <span className='text'>{item.label}</span>
            </div>
        })
        }
        <Dropdown menu={{
            items: menus.slice(4).map(item => ({
                key: item.key,
                label: <span style={{
                    color: curMenu === item.key ? colorPrimary : colorTextSecondary,
                    paddingLeft: 12
                }}>{item.label}</span>,
                icon:
                    item.key === 'notification' ? <Badge count={5}>
                        <LinearIcon name={item.key} color={curMenu === item.key ? colorPrimary : colorTextSecondary} />
                    </Badge> : <LinearIcon name={item.key} color={curMenu === item.key ? colorPrimary : colorTextSecondary} />
                ,
            })),
            onClick: (item) => {
                setCurMenu(item.key)
                history.push(`/${item.key}`)
            }
        }} placement="topRight">
            <div className={`item `} style={{
                color: colorTextSecondary
            }}  >


                <EllipsisOutlined style={{
                    fontSize: 24,
                    verticalAlign: 'middle',
                    color: colorTextSecondary
                }} />

                <span className='text'><Trans>More</Trans></span>
            </div>
        </Dropdown>
    </div>
}