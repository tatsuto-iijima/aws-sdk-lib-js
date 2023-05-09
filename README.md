# aws-sdk-lib-js
AWS SDK Library for JavaScript.

## Usage

### Installation

```
npm install my-aws-sdk-lib
```

### Use in your code

You can use a classic import to get access to each service namespaces:

```
import { aws_cloudformation as cfn } from 'my-aws-sdk-lib';

(async () => {
    const client = new cfn.Client({});
    const response = await client.describeStacks({
        StackName: 'TestStack',
    });
})();
```