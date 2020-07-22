import axios, { AxiosResponse, AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import MembershipTecnogym from '../interfaces/MembershipInterface'
import UserTecnogym from '../interfaces/UserInterface'
import logger from '../config/log'
dotenv.config()

class TecnogymService {
  public instance: AxiosInstance = axios.create({
    baseURL: process.env.API_MY_WELL_URL,
    headers: {
      'X-MWAPPS-CLIENT': 'thirdParties',
      'X-MWAPPS-APIKEY': process.env.API_MY_WELL_KEY,
      'Content-Type': 'application/json'
    }
  });

  public async Auth (facilityUrl: string): Promise<AxiosResponse> {
    try {
      return await this.instance.post(`/${facilityUrl}/application/69295ed5-a53c-434b-8518-f2e0b5f05b28/AccessIntegration`, {
        apiKey: process.env.API_MY_WELL_KEY,
        username: process.env.API_MY_WELL_USER_NAME,
        password: process.env.API_MY_WELL_PASSWORD
      })
    } catch (err) {
      logger.error(err)
      console.log(err)
    }
  }

  public async Create (user: UserTecnogym, facilityUrl: string, facilityId: string, token: string): Promise<AxiosResponse> {
    try {
      return await this.instance.post(`/${facilityUrl}/core/facility/${facilityId}/CreateFacilityUserFromThirdParty`, {
        ...user,
        token
      })
    } catch (err) {
      logger.error(err)
      console.log(err)
    }
  }

  public async Update (user: object, facilityUrl: string, facilityUserId: string, token: string): Promise<AxiosResponse> {
    try {
      return await this.instance.post(`/${facilityUrl}/core/facilityuser/${facilityUserId}/Update`, {
        ...user,
        token
      })
    } catch (err) {
      logger.error(err)
      console.log(err)
    }
  }

  public async SaveMembership (memberShip: MembershipTecnogym, facilityUrl: string, facilityUserId: string): Promise<AxiosResponse> {
    try {
      return await this.instance.post(`/${facilityUrl}/core/facilityuser/${facilityUserId}/SaveMembership`, {
        ...memberShip
      })
    } catch (err) {
      logger.error(err)
      console.log(err)
    }
  }

  public async Delete (facilityUrl: string, facilityUserId: string, token: string): Promise<AxiosResponse> {
    try {
      return await this.instance.post(`/${facilityUrl}/core/facilityuser/${facilityUserId}/Delete`, {
        token
      })
    } catch (err) {
      logger.error(err)
      console.log(err)
    }
  }

  public async Visit (facilityUrl: string, userId: string, token: string): Promise<AxiosResponse> {
    try {
      return await this.instance.post(`/${facilityUrl}/core/user/${userId}/Visit`, {
        token
      })
    } catch (err) {
      logger.error(err)
      console.log(err)
    }
  }

  public async GetUser (facilityUrl: string, facilityId: string, tokens: object): Promise<AxiosResponse> {
    try {
      return await this.instance.post(`/${facilityUrl}/core/facility/${facilityId}/GetFacilityUserFromPermanentToken`,
        tokens
      )
    } catch (err) {
      logger.error(err)
      console.log(err)
    }
  }
}

export default new TecnogymService()
