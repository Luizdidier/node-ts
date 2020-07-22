import { Router } from 'express'
import { TecnogymController } from './controllers/'

const routes = Router()

routes.post('/createUser', TecnogymController.createUser)
routes.post('/allUsers', TecnogymController.allUsers)
routes.post('/newUsers', TecnogymController.newUsers)
routes.delete('/deleteUser', TecnogymController.deleteUser)
routes.delete('/deleteUsersCA', TecnogymController.deleteUsersCA)
routes.put('/updateUser', (req, res, next) => {
  return TecnogymController.updateUser(req, res, next)
})
routes.put('/allUpdateUser', (req, res) => {
  TecnogymController.allUpdateUser(req, res)
})

export default routes
