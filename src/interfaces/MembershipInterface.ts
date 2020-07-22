export default interface MembershipInterface{
    operation: string,
    memberSince: string,
    startOn: string,
    expiresOn: string,
    description?: string
    token?: string
}
