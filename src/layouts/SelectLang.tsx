import { SelectLang, setLocale, useIntl } from 'umi';
import { Button, Popover, Tooltip, Typography, theme } from 'antd';
import './index.less'
export default () => {
  const intl = useIntl();
  const { token: { colorPrimary, colorText } } = theme.useToken()
  const currentLang = intl.locale === 'en-US' ? 'English' : '中文';
  return <Tooltip title='中文 / English' >
    <Button type='text' onClick={() => { setLocale(currentLang === 'English' ? 'zh-CN' : 'en-US', false); }}>
      {currentLang === 'English' ? 'EN' : '中文'}
    </Button>
  </Tooltip >;
};