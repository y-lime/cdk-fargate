import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { IRepository, Repository, RepositoryEncryption, TagMutability } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class FargateStackECR extends Stack {
    public readonly myappEcr: IRepository;

    constructor(scope: Construct, id: string, props?: StackProps,) {
        super(scope, id, props);

        const myappEcr = new Repository(this, 'myapp-ecr', {
            repositoryName: 'myapp-ecr',
            imageTagMutability: TagMutability.MUTABLE,
            imageScanOnPush: false,
            encryption: RepositoryEncryption.KMS,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        this.myappEcr = myappEcr;
    }
}
