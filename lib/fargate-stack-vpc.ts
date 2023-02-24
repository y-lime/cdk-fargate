import { Stack, StackProps } from 'aws-cdk-lib';
import { IpAddresses, IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class FargateStackVpc extends Stack {
    public readonly vpc: IVpc;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const fargateVpc = new Vpc(this, 'vpc', {
            ipAddresses: IpAddresses.cidr('20.100.0.0/16'),
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: "subnet-private-elb-",
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-service-",
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-management-",
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-db-",
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
                {
                    cidrMask: 24,
                    name: "subnet-private-vpce-",
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },

            ]
        });

        this.vpc = fargateVpc;
    }

}