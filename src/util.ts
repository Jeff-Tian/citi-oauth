class CitiAPIError extends Error {
  public code!: string
  public meta!: object

  constructor(msg: string) {
    super(msg)

    this.name = 'CitiAPIError'
  }
}

export const wrapper = (requestFunc: (url: string, data?: any, options?: object) => Promise<any>) => {
  return async (url: string, data?: any, options?: object) => {
    try {
      const { data: res } = await requestFunc(url, data, options)

      if (res.errcode) {
        const error = new CitiAPIError(res.errmsg)
        error.code = res.errcode
        error.meta = { url, options }

        throw error
      }

      return res
    } catch (err) {
      console.error('碰到了错误！')
      console.error(err)
      if (!(err instanceof CitiAPIError)) {
        err.name = 'CitiAPI' + err.name
      }

      throw err
    }
  }
}
