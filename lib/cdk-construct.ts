import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { pipelines } from 'aws-cdk-lib';

export interface PipelineProps {
    codePipelineProps: pipelines.CodePipelineProps;
}

export class Pipeline extends Construct {
    readonly pipeline: pipelines.CodePipeline;

    constructor(scope: Construct, id: string, props: PipelineProps) {
        super(scope, id);
        this.pipeline = new pipelines.CodePipeline(this, 'Pipeline', props.codePipelineProps);
    }

    addStage = (stage: cdk.Stage, options?: pipelines.AddStageOpts) => {
        return this.pipeline.addStage(stage, options);
    }

    addWave = (id: string, options?: pipelines.WaveOptions) => {
        return this.pipeline.addWave(id, options);
    }
}

export class TestBucket extends Construct {
    readonly bucket: cdk.aws_s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.bucket = new cdk.aws_s3.Bucket(this, 'Bucket', {
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        new cdk.CfnOutput(this, 'BucketName', {
            value: this.bucket.bucketName,
        });
        new cdk.aws_s3_deployment.BucketDeployment(this, 'TestFile', {
            sources: [cdk.aws_s3_deployment.Source.data('test.txt', 'hello, world!')],
            destinationBucket: this.bucket,
            destinationKeyPrefix: 'test',
        });
    }
}