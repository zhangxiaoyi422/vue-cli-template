import axios from 'axios';
import router from './router'
import store from './store/store'
import {Message} from 'iview'

axios.defaults.baseURL = "/api";//全局配置baseURL

//http request 拦截器
axios.interceptors.request.use(
    config => {
        if (store.state.token) {
            config.headers.Authorization = `token ${store.state.token}`;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

// http response 拦截器
axios.interceptors.response.use(
    response => {
        switch (response.data.code) {
            // SUCESS(200, "success"),
            // /**数据错误 10开头*/
            // ERROR10001(10001, " {0}"),
            // ERROR10002(10002, " {0}不能为空"),
            // ERROR10003(10003, "数据已经存在,无需再添加"),
            // ERROR10004(10004, "该记录不存在"),
            // /**系统错误 90开头*/
            // ERROR90000(90000, "access-token不能为空"),
            // ERROR90001(90001, "访问TOKEN已过期,请重新获取!"),
            // ERROR90002(90002, "获取访问TOKEN失败,请联系客服!"),
            // ERROR90003(90003, "系统异常,请联系客服!");
            case 90001:
                store.commit('REMOVE_TOKEN');
                let basePath = store.state.basePath + 'alliance/logout.aspx'
                // window.location.href = basePath
                break
            case 10001:
                Message.error(response.data.errorMsg);console.log(response);break
            case 10002:
                Message.error(response.data.errorMsg);console.log(response);break  
            case 10003:
                Message.error(response.data.errorMsg);console.log(response);break
            case 10004:
                Message.error(response.data.errorMsg);console.log(response);break
            case 90000:
                Message.error(response.data.errorMsg);console.log(response);break
            case 90001:
                Message.error(response.data.errorMsg);console.log(response);break
            case 90002:
                Message.error(response.data.errorMsg);console.log(response);break
            case 90003:
                Message.error(response.data.errorMsg);console.log(response);break
        }
        return response;
    }
);

export default axios;