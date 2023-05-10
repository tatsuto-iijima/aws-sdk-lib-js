#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Pipeline, TestBucket } from '../lib/cdk-construct';

const app = new cdk.App();
[ new Construct(app, 'StgAwsSdkLibJs') ].map(scope => {
    const pipelineStack = new cdk.Stack(scope, 'PipelineStack');
    const input = cdk.pipelines.CodePipelineSource.connection('tatsuto-iijima/aws-sdk-lib-js', 'release', {
        connectionArn: 'arn:aws:codestar-connections:us-east-1:931579793292:connection/64cd5e0c-416b-48fd-b743-def9f888db41',
    });
    const pipelineArtifact = new cdk.aws_s3.Bucket(pipelineStack, 'ArtifactBucket', {
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const pipeline = new Pipeline(pipelineStack, 'Pipeline', {
        codePipelineProps: {
            synth: new cdk.pipelines.ShellStep('Synth', {
                input: input,
                commands: [
                    'npm install',
                    'npx cdk synth',
                ],
            }),
            artifactBucket: pipelineArtifact,
        },
    });
    const deployWave = pipeline.addWave('Deploy');
    const s3TestStage = new cdk.Stage(pipelineStack, 'DeployS3Test');
    const s3TestStack = new cdk.Stack(s3TestStage, 'S3TestStack');
    new TestBucket(s3TestStack, 'TestBucket');
    deployWave.addStage(s3TestStage);
    deployWave.addPost(new cdk.pipelines.ShellStep('Test', {
        input: input,
        commands: [
            'npm install',
            'npm test',
        ],
    }));
    pipeline.pipeline.buildPipeline();
    const destroyStage = pipeline.pipeline.pipeline.addStage({ stageName: 'Destroy' });
    destroyStage.addAction(new cdk.aws_codepipeline_actions.CloudFormationDeleteStackAction({
        actionName: 'S3TestStack',
        adminPermissions: true,
        stackName: s3TestStack.stackName,
    }));
    pipeline.pipeline.pipeline.notifyOnExecutionStateChange(
        'Nortification',
        cdk.aws_chatbot.SlackChannelConfiguration.fromSlackChannelConfigurationArn(
            pipelineStack,
            'SlackChannel',
            'arn:aws:chatbot::931579793292:chat-configuration/slack-channel/ci-cd'
        )
    );
});
/**
 * Test for develop
 */
const uuid = process.env.MY_AWS_SDK_LIB_TEMP_UUID;
const devScope = new Construct(app, 'DevAwsSdkLibJs');
const devS3TestStack = new cdk.Stack(devScope, uuid ? 'S3TestStack-' + uuid : 'S3TestStack');
new TestBucket(devS3TestStack, 'TestBucket');
