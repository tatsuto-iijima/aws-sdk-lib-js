#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

const app = new cdk.App();
const stack = new cdk.Stack(app, process.env.MY_AWS_SDK_LIB_S3_TEST_STACK_NAME || 'MyAwsSdkLibS3TestStack');
const bucket = new cdk.aws_s3.Bucket(stack, 'Bucket', {
    autoDeleteObjects: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
});
new cdk.CfnOutput(stack, 'BucketName', {
    value: bucket.bucketName,
});
new cdk.aws_s3_deployment.BucketDeployment(stack, 'TestFile', {
    sources: [cdk.aws_s3_deployment.Source.data('test.txt', 'hello, world!')],
    destinationBucket: bucket,
    destinationKeyPrefix: 'test',
});
