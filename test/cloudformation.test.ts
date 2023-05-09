import * as cfn from '../aws-cloudformation';
import { v4 as uuidv4 } from 'uuid';

describe('Checking the method "describeStacks"', () => {
    test('Return an error if a nonexistent stack is specified', async () => {
        const client = new cfn.Client({});
        expect.assertions(1);
        try {
            await client.describeStacks({
                StackName: 'noexist-stack-' + uuidv4(),
            });
        } catch (error) {
            expect(error).toMatchObject({
                Code: 'ValidationError',
            });
        }
    });

    test('Successfully Stack', async () => {
        const stackName = process.env.MY_AWS_SDK_LIB_S3_TEST_STACK_NAME || 'MyAwsSdkLibS3TestStack';
        const client = new cfn.Client({});
        const response = await client.describeStacks({
            StackName: stackName,
        });
        expect(response).toMatchObject({
            $metadata: {
                httpStatusCode: 200,
            },
            Stacks: [
                {
                    StackName: stackName,
                },
            ],
        });
    });
});
