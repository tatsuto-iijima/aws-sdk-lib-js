import {
    S3Client,
    S3ClientConfig,
    GetObjectCommand,
    GetObjectCommandInput,
    PutObjectCommand,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3';

export class Client {
    readonly client: S3Client;

    constructor(config: S3ClientConfig) {
        this.client = new S3Client(config);
    }

    getObject = async (input: GetObjectCommandInput) => {
        const command = new GetObjectCommand(input);
        const response = await this.client.send(command);
        return response;
    };

    putObject = async (input: PutObjectCommandInput) => {
        const command = new PutObjectCommand(input);
        const response = await this.client.send(command);
        return response;
    };
}
