import { ClasschartsClient } from '../client'
const { code, dob } = require('../../src/tests/config.json')
async function main() {
    const client = new ClasschartsClient(code, dob)
    await client.init()
    console.log(
        await client.listHomeworks('due_date', '2021-10-21', '2021-11-27')
    )
}

main()
