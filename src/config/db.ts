import Knex from 'knex'
import dotenv from 'dotenv'
dotenv.config()

export const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  debug: true,
  pool: { min: 0, max: 50 }
}

const instance: Knex = Knex(config as Knex.Config)

export const db = (): Knex => instance
