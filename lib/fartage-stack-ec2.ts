import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface Ec2Props {
    vpc: ec2.Vpc;
    sg: ec2.SecurityGroup;
    role: iam.Role;
}

export class FargateStackEc2 extends cdk.Stack {
    constructor(scope: Construct, id: string, ec2props: Ec2Props, props?: cdk.StackProps) {
        super(scope, id, props);

        const userData = ec2.UserData.forLinux({
            shebang: '#!/bin/bash',
        });
        userData.addCommands(
            "yum update -y",
            "amazon-linux-extras enable postgresql13",
            "yum clean metadata",
            "yum install postgresql.x86_64 python3 -y",
            "pip3 install awscli --upgrade",
        );

        const ec2ManagementInstance = new ec2.Instance(this, 'EC2ManagementInstance', {
            instanceName: 'fargate-management-instance',
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            vpc: ec2props.vpc,
            securityGroup: ec2props.sg,
            role: ec2props.role,
            userData: userData,
            vpcSubnets: ec2props.vpc.selectSubnets({
                subnetGroupName: 'subnet-private-management-',
            }),
        });
        cdk.Tags.of(ec2ManagementInstance).add('Name', 'fargate-management-instance');

    }
}