import Knex from '../knexfile'

class TecnogymModel {
  public async getFacilityInfo (empresa: string): Promise<any> {
    try {
      return Knex.select('facilityUrl', 'empresa')
        .from('integracaotecnogym')
        .where('empresa', empresa)
        .first()
    } catch (err) {
      console.log(err)
    }
  }

  public async addPersonToPermanentToken (pessoa: string, permanentToken: string): Promise<void> {
    try {
      return Knex.from('pessoatecnogym')
        .insert({ pessoa: pessoa, permanenttoken: permanentToken })
    } catch (err) {
      console.log(err)
    }
  }

  public async getPerson (pessoa: string): Promise<any> {
    try {
      return Knex.raw("select pp.codigo as codPessoa, pp.nome as nomePessoa, pth.permanenttoken, plano.descricao as plano, (select numero from telefone where pessoa = cc.codigo and tipotelefone = 'CE' limit 1 ) as celular, (select numero from telefone where pessoa = cc.codigo and tipotelefone = 'RE' limit 1 ) as telefone, pp.sexo, pp.datanasc as dataNasc,( select email from email where email.pessoa = cc.pessoa limit 1), e.cep, cid.nome as cidade, est.descricao as estado, pp.datacadastro, c.vigenciade as startOn, c.vigenciaateajustada as expiresOn, plano.descricao as plano, cc.empresa as empresa from cliente cc inner join pessoa pp on pp.codigo = cc.pessoa inner join pessoatecnogym pth on pp.codigo = pth.pessoa inner join empresa emp on cc.empresa = emp.codigo inner join endereco e on e.pessoa = pp.codigo inner join cidade cid on cid.codigo = pp.cidade inner join estado est on est.codigo = pp.estado inner join contrato c on	c.pessoa = pp.codigo inner join plano on plano.codigo = c.plano where c.vigenciaAteAjustada >= current_date and cc.codigo not in (select e.codigo	from configuracaosistemaproselfitem conf inner join empresa e on e.codigo = conf.empresa where configuracaosistemaproself = 24 and current_date < to_date(valor, 'dd/mm/yyyy')) and plano.descricao not like '%DAY USE%' and plano.descricao not like '%IMPORTA%' and c.situacao <> 'CA' and pp.codigo = ? order by 1", [pessoa])
    } catch (err) {
      console.log(err)
    }
  }

  public async getPhonePerson (pessoa:string): Promise<any> {
    try {
      return Knex
        .select('tipotelefone as type', 'numero')
        .from('telefone')
        .where('pessoa', pessoa)
    } catch (err) {
      console.log(err)
    }
  }

  public async getAllPerson (empresa:string): Promise<any> {
    try {
      return Knex.raw("select pp.codigo, pp.nome as nome, (select numero from telefone where pessoa = cc.codigo and tipotelefone = 'CE' limit 1 ) as celular, (select numero from telefone where pessoa = cc.codigo and tipotelefone = 'RE' limit 1 ) as telefone, pp.sexo, pp.datanasc as dataNasc, (select email from email where email.pessoa = cc.pessoa limit 1), e.cep, cid.nome as cidade, est.descricao as estado, pp.datacadastro, c.vigenciade as startOn, c.vigenciaateajustada as expiresOn, plano.descricao as plano from cliente cc inner join pessoa pp on pp.codigo = cc.pessoa inner join endereco  e on e.pessoa = pp.codigo inner join cidade cid on cid.codigo = pp.cidade inner join estado est on est.codigo = pp.estado inner join contrato c on c.pessoa = pp.codigo inner join plano on plano.codigo = c.plano where c.vigenciaAteAjustada >= current_date and cc.codigo not in (SELECT e.codigo FROM   configuracaosistemaproselfitem conf INNER JOIN empresa e ON e.codigo = conf.empresa WHERE  configuracaosistemaproself = 24 and current_date < to_date(valor, 'dd/mm/yyyy')) and plano.descricao not like '%DAY USE%' and plano.descricao not like '%IMPORTA%' and c.situacao <> 'CA' and c.empresa = ? order by 1", [empresa])
    } catch (err) {
      console.log(err)
    }
  }

  public async getAllPersonCA (): Promise<any> {
    try {
      return Knex.raw('select distinct it."facilityUrl", pt.permanenttoken, p.codigo from cliente cli inner join pessoa p on p.codigo = cli.pessoa left join situacaoclientesinteticodw st on st.codigocliente = cli.codigo inner join contrato con on con.codigo = st.codigocontrato inner join empresa e on e.codigo = cli.empresa inner join integracaotecnogym it on e.codigo = it.empresa inner join pessoatecnogym pt on pt.pessoa = p.codigo inner join contratooperacao co on co.contrato = con.codigo and co.tipooperacao = \'CA\' inner join justificativaoperacao jo on co.tipojustificativa = jo.codigo where con.vigenciaateajustada::date between now()::date-10 and now()::date and st.situacaocontrato ilike \'CA\' and e.codigo in (145,199,207)')
    } catch (err) {
      console.log(err)
    }
  }

  public async getPersonForPermmanentToken (empresa:string): Promise<any> {
    try {
      return Knex.raw("select pp.codigo, pp.nome as nome, (select numero from telefone where pessoa = cc.codigo and tipotelefone = 'CE' limit 1 ) as celular, (select numero from telefone where pessoa = cc.codigo and tipotelefone = 'RE' limit 1 ) as telefone, pp.sexo, pp.datanasc as dataNasc, (select email from email where email.pessoa = cc.pessoa limit 1), e.cep, cid.nome as cidade, est.descricao as estado, pp.datacadastro, c.vigenciade as startOn, c.vigenciaateajustada as expiresOn, plano.descricao as plano from cliente cc inner join pessoa pp on pp.codigo = cc.pessoa inner join endereco  e on e.pessoa = pp.codigo inner join cidade cid on cid.codigo = pp.cidade inner join estado est on est.codigo = pp.estado inner join contrato c on c.pessoa = pp.codigo inner join plano on plano.codigo = c.plano where c.vigenciaAteAjustada >= current_date and cc.codigo not in (SELECT e.codigo FROM   configuracaosistemaproselfitem conf INNER JOIN empresa e ON e.codigo = conf.empresa WHERE  configuracaosistemaproself = 24 and current_date < to_date(valor, 'dd/mm/yyyy')) and plano.descricao not like '%DAY USE%' and plano.descricao not like '%IMPORTA%' and c.situacao <> 'CA' and c.empresa = ? and pp.codigo not in (select pessoatecnogym.pessoa from pessoatecnogym where pessoatecnogym.pessoa = cc.pessoa ) order by 1", [empresa])
    } catch (err) {
      console.log(err)
    }
  }

  public async deletePermanentToken (pessoa:string): Promise<any> {
    try {
      return Knex.from('pessoatecnogym').where('pessoa', pessoa).del()
    } catch (err) {
      console.log(err)
    }
  }

  public async getPermanentToken (pessoa: string): Promise<any> {
    try {
      return Knex.select('permanenttoken').from('pessoatecnogym').where('pessoa', pessoa)
    } catch (err) {
      console.log(err)
    }
  }
}

export default new TecnogymModel()
