import axios from 'axios';

const MseUtil = axios.create({
  baseURL: 'http://192.168.1.230:9900',
  timeout: 1000 // 请求超时时间
});

// 添加请求拦截器，设置默认headers
MseUtil.interceptors.request.use(
  (config) => {
    // 设置默认headers
    config.headers = {
      ...config.headers,
      appid: '188a04baba3f951117b77844359a4be4',
      method: 'operation_record'
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
MseUtil.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default MseUtil;
