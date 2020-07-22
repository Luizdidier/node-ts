import CroppedName from '../interfaces/CroppedName'

const transformName = (name: string): CroppedName => {
  try {
    const fullName = name.trim().split(' ')
    let firstName = ''
    let lastName = ''
    let retorno: CroppedName

    if (fullName.length > 2) {
      fullName.map((el, index) => {
        if (index < 2) { firstName += ' ' + el } else lastName += ' ' + el
      })

      retorno = {
        firstName: firstName.trim(),
        lastName: lastName.trim()
      }
    } else if (fullName.length === 1) {
      retorno = {
        firstName: fullName[0].trim(),
        lastName: ''
      }
    } else if (fullName.length === 2) {
      retorno = {
        firstName: fullName[0].trim(),
        lastName: fullName[1].trim()
      }
    }
    return retorno
  } catch (err) {
    console.log(err)
  }
}

export default transformName
