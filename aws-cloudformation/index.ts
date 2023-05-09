import {
    CloudFormationClient,
    CloudFormationClientConfig,
    DescribeStacksCommand,
    DescribeStacksCommandInput,
} from '@aws-sdk/client-cloudformation';

export class Client {
    readonly client: CloudFormationClient;

    constructor(config: CloudFormationClientConfig) {
        this.client = new CloudFormationClient(config);
    }

    describeStacks = (input: DescribeStacksCommandInput) => {
        const command = new DescribeStacksCommand(input);
        const response = this.client.send(command);
        return response;
    };
}
