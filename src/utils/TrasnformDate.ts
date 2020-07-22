const transformDate = (date: string) : string => {
  console.log(date)
  const formatDate = new Date(date)
  const retorno = `${formatDate.getFullYear()}-${formatDate.getMonth() + 1}-${formatDate.getDate()}`

  return retorno
}

export default transformDate
