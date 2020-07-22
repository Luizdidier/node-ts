import app from './app'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.listen(process.env.PORT)
