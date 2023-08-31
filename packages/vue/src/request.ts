import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, Canceler } from 'axios'

interface SourcesTypes {
  umet: string
  cancel: Canceler
}

interface ResponseTypes {
  code: number
  data: unknown
  message: string
}

const http = axios.create({
  // 请求携带描述多语言信息的头部
  headers: {
    Accept: 'application/json',
  },
  timeout: 10000,
  // 携带cookie信息
  withCredentials: true,
  baseURL: 'https://api.github.com',
})

const { CancelToken } = axios
const sources: SourcesTypes[] = [] // 定义数组用于存储每个ajax请求的取消函数及对应标识

/**
 * 请求防抖当一个url地址被请求多次就会取消前一次请求
 */
const removeSource = (config: AxiosRequestConfig) => {
  sources.forEach((item, index) => {
    // 当多次请求相同时，取消之前的请求
    if (
      config.url &&
      config.method &&
      item.umet === `${config.url}&${config.method}`
    ) {
      item.cancel('取消请求')
      sources.splice(index, 1)
    }
  })
}

/**
 * 请求拦截器
 */
http.interceptors.request.use(
  (config) => {
    const newConfig = config
    removeSource(newConfig)

    newConfig.cancelToken = new CancelToken((c) => {
      // 将取消函数存起来
      if (newConfig.url && newConfig.method) {
        sources.push({
          umet: `${newConfig.url}&${newConfig.method}${JSON.stringify(
            newConfig.params || newConfig.data
          )}`,
          cancel: c,
        })
      }
    })
    if (newConfig.data) {
      newConfig.data = JSON.stringify(newConfig.data)
    }
    return newConfig
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
http.interceptors.response.use(
  (res) => {
    const newRes = res as AxiosResponse<ResponseTypes>
    removeSource(res.config)
    if (
      ![200, 201].includes(newRes.data.code) &&
      String(newRes.data.code) !== '00000'
    ) {
      const msg = newRes.data.message || '请求错误'
      return Promise.reject(new Error(msg))
    }
    return res.data
  },
  (error) => {
    if (!error.response) {
      return false
    }
    switch (error.response.status) {
      // 404请求不存在
      case 404: {
        break
      }
      // 其他错误，直接抛出错误提示
      default:
        console.log(error)
    }
    return Promise.reject(error.response)
  }
)

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {any} params [请求时携带的参数]
 */
function shuimoGet<T>(
  url: string,
  params: Record<string, string | number>
): Promise<AxiosResponse<T>['data']> {
  return new Promise((resolve, reject) => {
    http
      .get(url, {
        params,
      })
      .then((res: AxiosResponse<T>) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {AxiosResponse} params [请求时携带的参数]
 */
function shuimoPost<T, D extends Object>(
  url: string,
  params: D
): Promise<AxiosResponse<T>['data']> {
  return new Promise((resolve, reject) => {
    http
      .post(url, params)
      .then((res: AxiosResponse<T>) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export const formatErrorMsg = (err: {
  response: { data: { message: any; errors: any[] } }
  message: string
}) => {
  let msg = 'Error: '
  if (err.response && err.response.data && err.response.data.message) {
    msg += `${err.response.data.message}. `
    err.response.data.errors &&
      (msg += err.response.data.errors.map((e) => e.message).join(', '))
  } else {
    msg += err.message
  }
  return msg
}

// 对外暴露
export { shuimoPost, shuimoGet }
