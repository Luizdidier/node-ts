import express from 'express'
import cors from 'cors'
import routes from './routes'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

class App {
    public express: express.Application

    public constructor () {
      this.express = express()
      this.middlewares()
      this.routes()
    }

    private middlewares (): void {
      this.express.use(express.json())
      this.express.use(cors())
      this.express.use(bodyParser.json())
      this.express.use(bodyParser.urlencoded({
        extended: false
      }))
      dotenv.config()
    }

    // private database (): string {
    //   const a = 'teste'
    //   return a
    // }

    private routes (): void {
      this.express.use(routes)
    }
}

export default new App().express
