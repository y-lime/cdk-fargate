import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FargateStackVpc } from './fargate-stack-vpc';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class FargateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ネットワーク基盤スタック
    const fargatestackvpc = new FargateStackVpc(this, 'VpcStack');

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'FargateQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
