import { Duration, RemovalPolicy, Stack, StackProps, Tags } from "aws-cdk-lib";
import { Key, KeyUsage } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

export class FargateStackKms extends Stack {
    public readonly rdsKey: Key;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const rdsKey = new Key(this, 'fargate-rds-key', {
            description: 'key to encrypt rds',
            keyUsage: KeyUsage.ENCRYPT_DECRYPT,
            pendingWindow: Duration.days(7),
            enableKeyRotation: true,
            removalPolicy: RemovalPolicy.DESTROY,
        });
        Tags.of(rdsKey).add('Name', 'fargate-rds');
        rdsKey.addAlias('fargate-rds');

        this.rdsKey = rdsKey;
    }
}