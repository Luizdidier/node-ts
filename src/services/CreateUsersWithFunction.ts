import TecnogymService from '../services/TecnogymService'
import TecnogymModel from '../model/TecnogymModel'
import plano from '../ENUM/plano'
import operations from '../ENUM/operations'
import transformName from '../utils/TransformName'
import CroppedName from '../interfaces/CroppedName'
import MembershipTecnogym from '../interfaces/MembershipInterface'
import transformDate from '../utils/TrasnformDate'
import logger from '../config/log'

const sleep = (ms) :Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function createUsersWithFunction (allUser: any, facilityUrl: string): Promise<void> {
  try {
    console.log(facilityUrl)
    for (const user of allUser) {
      await sleep(1000)

      const { data: response } = await TecnogymService.Auth(facilityUrl)
      console.log(response)
      const facilityId = response.data.facilities[0].id
      let token = response.token
      let pessoa = user
      const codPessoa = user.codigo
      const { firstName, lastName }: CroppedName = transformName(pessoa.nome)
      if (pessoa.nome !== undefined) {
        delete pessoa.nome
        pessoa = {
          firstName,
          lastName,
          ...pessoa
        }
        const memberSince = transformDate(pessoa.datacadastro)

        const createUser = {
          firstName: pessoa.firstName,
          lastName: pessoa.lastName || '.',
          dateOfBirth: transformDate(pessoa.datanasc),
          gender: pessoa.sexo,
          email: pessoa.email,
          externalId: pessoa.codigo
        }

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
          groups: []
        }

        if (pessoa.plano.includes('LIGHT')) {
          updateUser.groups = [plano.LIGHT]
        } else if (pessoa.plano.includes('PLUS') || pessoa.plano.includes('CORP')) {
          updateUser.groups = [plano.PLUS]
        }
        console.log(createUser)
        const { data: responseCreate } = await TecnogymService.Create(createUser, facilityUrl, facilityId, token)
        console.log(responseCreate)
        logger.trace(responseCreate)
        token = responseCreate.token

        let permanentToken
        if (responseCreate.data && responseCreate.data.permanentToken) {
          permanentToken = responseCreate.data.permanentToken
          await TecnogymModel.addPersonToPermanentToken(codPessoa, permanentToken)

          const facilityUserId = responseCreate.data.facilityUserId

          const { data: responseUpdate } = await TecnogymService.Update(updateUser, facilityUrl, facilityUserId, token)
          logger.trace(responseUpdate)
          if (responseUpdate) {
            token = responseUpdate.token

            const memberShip: MembershipTecnogym = {
              operation: operations.subscribe,
              memberSince: memberSince,
              startOn: pessoa.starton,
              expiresOn: pessoa.expireson,
              description: '',
              token: token
            }

            const { data: memberResponse } = await TecnogymService.SaveMembership(memberShip, facilityUrl, facilityUserId)
            logger.trace(memberResponse)

            console.log('==================== RESPONSE = CREATE =========================')
            console.log(responseCreate)
            console.log('==================== RESPONSE = CREATE =========================')

            if (Object.keys(responseCreate)[0] === 'data') {
              logger.trace(JSON.stringify(responseCreate.data) + '' + codPessoa)
            }

            if (Object.keys(responseCreate.data)[0] === 'result') {
              logger.info(JSON.stringify(responseCreate.data.result) + '' + codPessoa)
            }

            if (Object.keys(responseCreate)[0] === 'errors') {
              logger.error(JSON.stringify(responseCreate.errors) + '' + codPessoa)
            }
          } else {
            logger.error('Response Update UNDEFINED' + ' | ' + codPessoa)
          }
        } else {
          logger.error(JSON.stringify(responseCreate.data) + '| PERMANT TOKEN DONT EXISTS' + ' | ' + codPessoa)
        }
      }
    }
  } catch (err) {
    logger.error(err.stack + ' | TecnogymController CreateUsersWithFunction Function')
  }
}
