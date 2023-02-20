import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { TagMutability } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class FargateStackECR extends cdk.Stack {
    public readonly myappEcr: ecr.Repository;

    constructor(scope: Construct, id: string, props?: cdk.StackProps,) {
        super(scope, id, props);

        const myappEcr = new ecr.Repository(this, 'myapp-ecr', {
            repositoryName: 'myapp-ecr',
            imageTagMutability: TagMutability.MUTABLE,
            imageScanOnPush: false,
            encryption: ecr.RepositoryEncryption.KMS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        this.myappEcr = myappEcr;
    }
}
