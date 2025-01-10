import type { RequestConfig } from 'umi';
import { history } from 'umi';
window.BUILD_ENV = (process.env.BUILD_ENV || 'testnetDev') as Window["BUILD_ENV"];
export const request: RequestConfig = {
    timeout: 10000,
    validateStatus: function (status: number) {
        return status >= 200 && status < 300; // default
    },
    requestInterceptors: [],
    responseInterceptors: [
        [
            (response) => {
                return response
            }, (error: any) => {
                console.log('error', error);
                if (error && error.response && error.response.status === 401) {
                    history.push('/dashboardLogin');
                }

                return Promise.reject(error)
            }
        ]
    ]
};

