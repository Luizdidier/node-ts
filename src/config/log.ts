import { Logger } from '@tsed/logger'
import moment from 'moment'

const log = new Logger('red-tecnogym')
const date = moment().format('DD-MM-YYYY')
log.appenders
  .set('console-log', {
    type: 'console',
    filename: `${__dirname}/../logs/red-technogym_${date}.txt`,
    layout: {
      type: 'json',
      separator: ','
    }
  })

export default log
