import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class FargateStackVpc extends cdk.Stack {
    public readonly fargateVpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const fargateVpc = new ec2.Vpc(this, 'vpc', {
            cidr: '20.100.0.0/16',
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: "subnet-private-elb-",
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-service-",
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-management-",
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-db-",
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-vpce-",
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },

            ]
        });

        this.fargateVpc = fargateVpc;
    }

}