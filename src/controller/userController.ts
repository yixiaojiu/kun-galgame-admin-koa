import { Context } from 'koa'
import UserService from '@/service/userService'
import { setCookieAdminToken, getCookieTokenInfo } from '@/utils/cookies'
import { setValue, getValue, delValue } from '@/config/redisConfig'

import { isValidEmail, isValidName, isValidPassword } from '@/utils/validate'

import type { SortOrder, SortFieldRanking } from './types/userController'

class UserController {
  async login(ctx: Context) {
    const { name, password } = ctx.request.body

    if (
      !(isValidName(name) || isValidEmail(name)) ||
      !isValidPassword(password)
    ) {
      ctx.app.emit('kunError', 10104, ctx)
      return
    }

    const loginCD = await getValue(`loginCD:${name}`)
    if (loginCD) {
      ctx.app.emit('kunError', 10105, ctx)
      return
    } else {
      setValue(`loginCD:${name}`, name, 60)
    }

    const result = await UserService.loginUser(name, password)
    if (typeof result === 'number') {
      ctx.app.emit('kunError', result, ctx)
      return
    }

    setCookieAdminToken(ctx, result.token)

    ctx.body = result
  }

  async getUserByUsername(ctx: Context) {
    const name = ctx.query.name as string
    ctx.body = await UserService.getUserByUsername(name)
  }

  async banUserByUid(ctx: Context) {
    const uid = ctx.request.body.uid as string
    await delValue(`refreshToken:${uid}`)
    await UserService.updateUserByUid(uid, 'status', '1')
  }

  async unbanUserByUid(ctx: Context) {
    const uid = ctx.request.body.uid as string
    await UserService.updateUserByUid(uid, 'status', '0')
  }

  async deleteUserByUid(ctx: Context) {
    const uid = ctx.params.uid as string
    await delValue(`refreshToken:${uid}`)
    await UserService.deleteUserByUid(parseInt(uid))
  }

  async getUserByUid(ctx: Context) {
    const uid = parseInt(ctx.params.uid as string)
    ctx.body = await UserService.getUserByUid(uid)
  }

  async updateUserByUid(ctx: Context) {
    const uid = getCookieTokenInfo(ctx).uid

    const { fieldToUpdate, newFieldValue } = ctx.request.body

    await UserService.updateUserByUid(
      uid.toString(),
      fieldToUpdate,
      newFieldValue
    )
  }

  async getUserTopics(ctx: Context) {
    const tidArray = ctx.query.tidArray as string

    if (!tidArray) {
      return
    }

    const numberArray = tidArray.split(',').map((tid) => parseInt(tid))
    ctx.body = await UserService.getUserTopics(numberArray)
  }

  async getUserReplies(ctx: Context) {
    const ridArray = ctx.query.ridArray as string

    if (!ridArray) {
      return
    }

    const numberArray = ridArray.split(',').map((rid) => parseInt(rid))
    ctx.body = await UserService.getUserReplies(numberArray)
  }

  async getUserComments(ctx: Context) {
    const cidArray = ctx.query.cidArray as string

    if (!cidArray) {
      return
    }

    const numberArray = cidArray.split(',').map((cid) => parseInt(cid))
    ctx.body = await UserService.getUserComments(numberArray)
  }

  async getUserRanking(ctx: Context) {
    const { page, limit, sortField, sortOrder } = ctx.query

    ctx.body = await UserService.getUserRanking(
      parseInt(page as string),
      parseInt(limit as string),
      sortField as SortFieldRanking,
      sortOrder as SortOrder
    )
  }
}

export default new UserController()
