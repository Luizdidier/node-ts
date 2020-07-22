import { Request, Response } from 'express'
import TecnogymService from '../services/TecnogymService'
import TecnogymModel from '../model/TecnogymModel'
import plano from '../ENUM/plano'
import operations from '../ENUM/operations'
import transformName from '../utils/TransformName'
import CroppedName from '../interfaces/CroppedName'
import MembershipTecnogym from '../interfaces/MembershipInterface'
import transformDate from '../utils/TrasnformDate'
import createUsersWithFunction from '../services/CreateUsersWithFunction'
import logger from '../config/log'

class TecnogymController {
  constructor () {
    logger.name = 'TecnogymController'
  }

  public sleep (ms) :Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public async createUser (req: Request, res: Response): Promise<Response> {
    try {
      const empresa = req.headers.empresa as string
      const codPessoa = req.headers.pessoa as string

      let pessoa = await TecnogymModel.getPerson(codPessoa)
      const telefonePessoa = await TecnogymModel.getPhonePerson(codPessoa)

      const { firstName, lastName }: CroppedName = transformName(pessoa.nomePessoa)

      delete pessoa.nomePessoa
      pessoa = {
        firstName,
        lastName,
        ...pessoa
      }

      const memberSince = transformDate(pessoa.datacadastro)

      telefonePessoa.map((el) => {
        if (el.type === 'CE') { pessoa.celular = el.numero } else if (el.type === 'RE') { pessoa.telefone = el.numero }
      })

      const { facilityUrl } = await TecnogymModel.getFacilityInfo(empresa)
      if (facilityUrl) {
        const { data: response } = await TecnogymService.Auth(facilityUrl)
        const facilityId = response.data.facilities[0].id
        let { token } = response

        const createUser = {
          firstName: pessoa.firstName,
          lastName: pessoa.lastName || '.',
          dateOfBirth: transformDate(pessoa.dataNasc),
          gender: pessoa.sexo,
          email: pessoa.email,
          externalId: pessoa.codPessoa
        }

        const updateUser = {
          firstName: pessoa.firstName,
          lastName: pessoa.lastName || '.',
          birthDate: transformDate(pessoa.dataNasc),
          gender: pessoa.sexo,
          address: pessoa.endereco,
          zipCode: pessoa.cep,
          city: pessoa.cidade,
          phoneNumber: pessoa.telefone,
          mobilePhoneNumber: pessoa.celular,
          stateProvince: pessoa.estado,
          measurementSystem: 'Metric',
          groups: []
        }

        if (pessoa.plano.includes('LIGHT')) {
          updateUser.groups = [plano.LIGHT]
        } else if (pessoa.plano.includes('PLUS')) {
          updateUser.groups = [plano.PLUS]
        } else {
          updateUser.groups = [plano.VISITANTE]
        }

        const { data: responseCreate } = await TecnogymService.Create(createUser, facilityUrl, facilityId, token)

        token = responseCreate.token
        let permanentToken
        if (responseCreate.data && responseCreate.data.permanentToken) {
          permanentToken = responseCreate.data.permanentToken
          await TecnogymModel.addPersonToPermanentToken(codPessoa, permanentToken)
        } else {
          logger.error(JSON.stringify(responseCreate) + '' + codPessoa + '\n\r')
          return res.status(500).json({ error: responseCreate })
        }
        const facilityUserId = responseCreate.data.facilityUserId

        const { data: responseUpdate } = await TecnogymService.Update(updateUser, facilityUrl, facilityUserId, token)
        token = responseUpdate.token

        const memberShip: MembershipTecnogym = {
          operation: operations.subscribe,
          memberSince: memberSince,
          startOn: transformDate(pessoa.startOn),
          expiresOn: transformDate(pessoa.expiresOn),
          description: '',
          token: token
        }

        await TecnogymService.SaveMembership(memberShip, facilityUrl, facilityUserId)

        if (Object.keys(responseCreate)[0] === 'data') {
          logger.trace(JSON.stringify(responseCreate.data) + ' | ' + codPessoa)
          return res.status(200).json({ return: 'Cadastrado com sucesso !' })
        }

        if (Object.keys(response)[0] === 'errors') {
          logger.error(JSON.stringify(response.errors) + ' | ' + codPessoa)
          return res.status(401).json(response)
        }
      } else {
        logger.error('Empresa não cadastrada | CreateUser Function')
        return res.status(409).json({ errors: 'Empresa não cadastrada !' })
      }
    } catch (err) {
      logger.error(err + '| CreateUser Function')
      return res.status(500).json({ errors: 'Unexpected Error' })
    }
  }

  public async allUsers (req: Request, res: Response): Promise<Response> {
    try {
      const empresa = req.headers.empresa as string

      const { rows: allUser } = await TecnogymModel.getAllPerson(empresa)

      const { facilityUrl } = await TecnogymModel.getFacilityInfo(empresa)
      if (facilityUrl) {
        await createUsersWithFunction(allUser, facilityUrl)
        logger.trace('allUsers Success')
        return res.status(200).json({ return: 'Success' })
      } else {
        logger.error('Empresa não cadastrada | allUsers Function')
        return res.status(409).json({ errors: 'Empresa não cadastrada !', allUser })
      }
    } catch (err) {
      logger.error(err + '| allUsers Function')
      return res.status(500).json({ errors: 'Unexpected Error' })
    }
  }

  public async newUsers (req: Request, res: Response): Promise<Response> {
    try {
      const empresa = req.headers.empresa as string

      const { rows: allUser } = await TecnogymModel.getPersonForPermmanentToken(empresa)

      const { facilityUrl } = await TecnogymModel.getFacilityInfo(empresa)
      if (facilityUrl) {
        await createUsersWithFunction(allUser, facilityUrl)
        logger.trace('allUsers Success')
        return res.status(200).json({ return: 'Success' })
      } else {
        logger.error('Empresa não cadastrada | allUsers Function')
        return res.status(409).json({ errors: 'Empresa não cadastrada !', allUser })
      }
    } catch (err) {
      logger.error(err + '| allUsers Function')
      return res.status(500).json({ errors: 'Unexpected Error' })
    }
  }

  public async deleteUser (req: Request, res: Response): Promise<Response> {
    try {
      const empresa = req.headers.empresa as string
      const codPessoa = req.headers.pessoa as string

      const { facilityUrl } = await TecnogymModel.getFacilityInfo(empresa)
      if (facilityUrl) {
        const { data: response } = await TecnogymService.Auth(facilityUrl)

        const facilityId = response.data.facilities[0].id
        const pessoa = await TecnogymModel.getPermanentToken(codPessoa)
        const tokens = {
          token: response.token,
          permanentToken: pessoa.permanenttoken
        }
        if (pessoa.permanenttoken) {
          const { data: responseGetUser } = await TecnogymService.GetUser(facilityUrl, facilityId, tokens)

          const token = responseGetUser.token
          const { facilityUserId } = responseGetUser.data

          const { data: responseDeleteUser } = await TecnogymService.Delete(facilityUrl, facilityUserId, token)

          if (Object.keys(responseDeleteUser.data)[0] === 'result' || responseDeleteUser.data.result) {
            await TecnogymModel.deletePermanentToken(codPessoa)
          }

          logger.trace('deleteUser Function Success')
          return res.status(200).json({ messagem: 'Deletado com sucesso !', lastReturn: responseDeleteUser })
        } else {
          logger.debug(' Usuario não encontrado na plataforma | deleteUser Function Success' + codPessoa)
          return res.status(500).json({ error: 'Usuario não encontrado na plataforma !' })
        }
      } else {
        logger.error('Empresa não cadastrada | deleteUser Function')
        return res.status(409).json({ errors: 'Empresa não cadastrada !' })
      }
    } catch (err) {
      logger.error(err + '| deleteUser Function\n\r')
      return res.status(500).json({ errors: 'Unexpected Error', err: err.stack })
    }
  }

  public async deleteUsersCA (req: Request, res: Response): Promise<Response> {
    try {
      const { rows: allUser } = await TecnogymModel.getAllPersonCA()

      for (const user of allUser) {
        console.log(user)
        const { data: response } = await TecnogymService.Auth(user.facilityUrl)

        const facilityId = response.data.facilities[0].id
        const tokens = {
          token: response.token,
          permanentToken: user.permanenttoken
        }
        if (user.permanenttoken) {
          const { data: responseGetUser } = await TecnogymService.GetUser(user.facilityUrl, facilityId, tokens)

          const token = responseGetUser.token
          const { facilityUserId } = responseGetUser.data

          const { data: responseDeleteUser } = await TecnogymService.Delete(user.facilityUrl, facilityUserId, token)

          if (Object.keys(responseDeleteUser.data)[0] === 'result' || responseDeleteUser.data.result) {
            await TecnogymModel.deletePermanentToken(user.codigo)
          }
        } else {
          logger.debug(' Usuario não encontrado na plataforma | deleteUser Function Success' + user.codigo)
        }
      }
      logger.trace('deleteUsersCA Function Success')
      return res.status(200).json({ return: 'Success' })
    } catch (err) {
      logger.error(err + '| deleteUsersCA Function\n\r')
      return res.status(500).json({ errors: 'Unexpected Error', err: err.stack })
    }
  }

  public async updateUser (req: Request, res:Response, next: any): Promise<Response> {
    try {
      const codPessoa = req.headers.pessoa as string

      let { rows: [pessoa] } = await TecnogymModel.getPerson(codPessoa)
      const { facilityUrl } = await TecnogymModel.getFacilityInfo(pessoa.empresa)

      if (facilityUrl) {
        const { data: response } = await TecnogymService.Auth(facilityUrl)
        console.log(pessoa)
        const facilityId = response.data.facilities[0].id
        const { firstName, lastName }: CroppedName = transformName(pessoa.nomepessoa)

        delete pessoa.nomepessoa
        pessoa = {
          firstName,
          lastName,
          ...pessoa
        }

        const tokens = {
          token: response.token,
          permanentToken: pessoa.permanenttoken
        }
        if (tokens.permanentToken) {
          const updateUser = {
            firstName: pessoa.firstName,
            lastName: pessoa.lastName || '.',
            birthDate: transformDate(pessoa.datanasc),
            gender: pessoa.sexo,
            address: pessoa.endereco,
            zipCode: pessoa.cep,
            city: pessoa.cidade,
            phoneNumber: pessoa.telefone,
            mobilePhoneNumber: pessoa.celular,
            stateProvince: pessoa.estado,
            measurementSystem: 'Metric',
            email: pessoa.email,
            groups: []
          }

          if (pessoa.plano.includes('LIGHT')) {
            updateUser.groups = [plano.LIGHT]
          } else if (pessoa.plano.includes('PLUS')) {
            updateUser.groups = [plano.PLUS]
          } else {
            updateUser.groups = [plano.VISITANTE]
          }
          const { data: responseGetUser } = await TecnogymService.GetUser(facilityUrl, facilityId, tokens)

          tokens.token = responseGetUser.token

          const { facilityUserId } = responseGetUser.data

          const { data: responseUpdate } = await TecnogymService.Update(updateUser, facilityUrl, facilityUserId, tokens.token)
          logger.trace(`Update User success ! ${JSON.stringify(responseUpdate)} ${codPessoa}`)
          return res.status(200).json({ responseUpdate })
        } else {
          await this.createUser(req, res)
          next()
        }
      } else {
        logger.error('Empresa não cadastrada | updateUser Function')
        return res.status(409).json({ errors: 'Empresa não cadastrada !' })
      }
    } catch (err) {
      logger.error(err + ' | updateUser Function')
      return res.status(500).json({ errors: 'Unexpected Error', err: err.stack })
    }
  }

  public async allUpdateUser (req: Request, res:Response): Promise<Response> {
    try {
      const empresa = req.headers.empresa as string

      const { rows: allUser } = await TecnogymModel.getAllPerson(empresa)

      const { facilityUrl } = await TecnogymModel.getFacilityInfo(empresa)
      if (facilityUrl) {
        for (const user of allUser) {
          const { data: response } = await TecnogymService.Auth(facilityUrl)
          const token = response.token
          const facilityId = response.data.facilities[0].id
          let pessoa = await TecnogymModel.getPerson(user.codigo)
          const { firstName, lastName }: CroppedName = transformName(pessoa.nomePessoa)

          delete pessoa.nomePessoa
          pessoa = {
            firstName,
            lastName,
            ...pessoa
          }

          const tokens = {
            token: token,
            permanentToken: pessoa.permanenttoken
          }
          if (tokens.permanentToken) {
            const updateUser = {
              firstName: pessoa.firstName,
              lastName: pessoa.lastName || '.',
              birthDate: transformDate(pessoa.dataNasc),
              gender: pessoa.sexo,
              address: pessoa.endereco,
              zipCode: pessoa.cep,
              city: pessoa.cidade,
              phoneNumber: user.telefone,
              mobilePhoneNumber: user.celular,
              stateProvince: pessoa.estado,
              measurementSystem: 'Metric',
              groups: []
            }

            if (pessoa.plano.includes('LIGHT')) {
              updateUser.groups = [plano.LIGHT]
            } else if (pessoa.plano.includes('PLUS')) {
              updateUser.groups = [plano.PLUS]
            } else {
              updateUser.groups = [plano.VISITANTE]
            }

            const { data: responseGetUser } = await TecnogymService.GetUser(facilityUrl, facilityId, tokens)

            tokens.token = responseGetUser.token

            console.log('============= RESPONSE = GET = USER =======================')
            console.log(responseGetUser)
            console.log('============= RESPONSE = GET = USER =======================')

            if (responseGetUser && responseGetUser.data && responseGetUser.data.facilityUserId) {
              const { facilityUserId } = responseGetUser.data

              const { data: responseUpdate } = await TecnogymService.Update(updateUser, facilityUrl, facilityUserId, tokens.token)
              logger.trace(`Update User success ! ${JSON.stringify(responseUpdate)} | ${user.codigo}`)
              await this.sleep(800)
            } else {
              logger.error(JSON.stringify(responseGetUser))
            }
          }
        }
        return res.status(200).json({ messagem: 'Success' })
      } else {
        logger.error('Empresa não cadastrada | allUsers Function')
        return res.status(409).json({ errors: 'Empresa não cadastrada !' })
      }
    } catch (err) {
      logger.error(err + ' | allUpdateUser Function')
      return res.status(500).json({ errors: 'Unexpected Error', err: err.stack })
    }
  }
}

export default new TecnogymController()
