class CitiAPIError extends Error {
  public code!: string
  public meta!: object

  constructor(msg: string) {
    super(msg)

    this.name = 'CitiAPIError'
  }
}

export const wrapper = (
  requestFunc: (url: string, data?: any, options?: any) => Promise<any>,
  settings?: any
) => {
  return async (url: string, data?: any, options?: any) => {
    try {
      const {data: res} = await requestFunc(
        url.startsWith('http') ? url : `${settings.endpoint}${url}`,
        data,
        options
      )

      if (res.errcode) {
        const error = new CitiAPIError(res.errmsg)
        error.code = res.errcode
        error.meta = {url, options}

        throw error
      }

      return res
    } catch (err) {
      ;(settings.logger || console).error(
        '碰到了错误！',
        JSON.stringify(err.response.data)
      )
      err.request = {}
      err.response = {data: err.response ? err.response.data : null}
      ;(settings.logger || console).error(err)
      if (!(err instanceof CitiAPIError)) {
        err.name = 'CitiAPI' + err.name
      }

      throw err
    }
  }
}
