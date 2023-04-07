# Classcharts API

A client for the classcharts API

* [Documentation](https://classchartsapi.github.io/classcharts-api-js/)
* [API Documentation (with library examples)](https://classchartsapi.github.io/api-docs/#introduction)
* [Discord](https://discord.gg/DTcwugcgZ2)
# Examples
Docs are very much a WIP, for any help with the library, please join the discord above

```typescript
import { StudentClient } from "classcharts-api";
async function main() {
  const client = new StudentClient("classchartsCode", "01/1/2000");
  await client.login();
  console.log(
    await client.getBehaviour({
      fromDate: "20/01/2000",
      toDate: "01/02/2000",
    })
  );
  console.log(await client.getActivity());
  console.log(await client.getStudentInfo());
  console.log(await client.getActivity());
  console.log(await client.getActivity());
}

main();
```
