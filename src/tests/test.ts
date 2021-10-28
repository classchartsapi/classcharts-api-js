import { ClasschartsClient } from '../client'
const { code, dob } = require('../../src/tests/config.json')
async function main() {
    const client = new ClasschartsClient(code, dob)
    await client.init()
    console.log(await client.getBehaviour(null))
    console.log(await client.getActivity(null))
}

main()
