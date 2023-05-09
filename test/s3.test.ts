import * as cfn from '../aws-cloudformation';
import * as s3 from '../aws-s3';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

let testBucketName: string;

beforeAll(async () => {
    const stackName = process.env.MY_AWS_SDK_LIB_S3_TEST_STACK_NAME || 'MyAwsSdkLibS3TestStack';
    const client = new cfn.Client({});
    const response = await client.describeStacks({
        StackName: stackName,
    });
    if (!response.Stacks || response.Stacks.length !== 1) {
        throw new Error('Unexpected');
    } else {
        const targetOutput = response.Stacks[0].Outputs?.filter((output) => output.OutputKey === 'BucketName');
        if (!targetOutput || targetOutput.length !== 1 || !targetOutput[0].OutputValue) {
            throw new Error('Unexpected');
        } else {
            testBucketName = targetOutput[0].OutputValue;
        }
    }
});

describe('Checking the method "getObject"', () => {
    test('Return an error if a nonexistent bucket is specified', async () => {
        const client = new s3.Client({});
        expect.assertions(1);
        try {
            await client.getObject({
                Bucket: 'noexist-bucket-' + uuidv4(),
                Key: 'test/test.txt',
            });
        } catch (error) {
            expect(error).toMatchObject({
                Code: 'NoSuchBucket',
            });
        }
    });

    test('Return an error if the object does not exist', async () => {
        const client = new s3.Client({});
        expect.assertions(1);
        try {
            await client.getObject({
                Bucket: testBucketName,
                Key: uuidv4() + '/test.txt',
            });
        } catch (error) {
            expect(error).toMatchObject({
                Code: 'NoSuchKey',
            });
        }
    });

    test('Successfully download the object', async () => {
        const client = new s3.Client({});
        const response = await client.getObject({
            Bucket: testBucketName,
            Key: 'test/test.txt',
        });
        const body = await response.Body?.transformToString();
        expect(response).toMatchObject({
            $metadata: {
                httpStatusCode: 200,
            },
        });
        expect(body).toEqual('hello, world!');
    });
});

describe('Checking the method "putObject"', () => {
    let uploadData: Buffer;

    beforeAll(async () => {
        uploadData = fs.readFileSync(path.join(__dirname, 'aws_logo_smile.png'));
    });

    test('Return an error if a nonexistent bucket is specified', async () => {
        const client = new s3.Client({});
        expect.assertions(1);
        try {
            await client.putObject({
                Body: uploadData,
                Bucket: 'noexist-bucket-' + uuidv4(),
                Key: 'test/aws_logo_smile.png',
            });
        } catch (error) {
            expect(error).toMatchObject({
                Code: 'NoSuchBucket',
            });
        }
    });

    test('Successfully upload the object', async () => {
        const client = new s3.Client({});
        const response = await client.putObject({
            Body: uploadData,
            Bucket: testBucketName,
            Key: 'test/aws_logo_smile.png',
        });
        const resGetObject = await client.getObject({
            Bucket: testBucketName,
            Key: 'test/aws_logo_smile.png',
        });
        const downloadData = await resGetObject.Body?.transformToByteArray();
        expect(response).toMatchObject({
            $metadata: {
                httpStatusCode: 200,
            },
        });
        expect(downloadData).toEqual(Uint8Array.from(uploadData));
    });
});
