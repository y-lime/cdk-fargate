import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { AmazonLinuxGeneration, Instance, InstanceClass, InstanceSize, InstanceType, ISecurityGroup, IVpc, MachineImage, UserData } from 'aws-cdk-lib/aws-ec2';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface Ec2Props {
    vpc: IVpc;
    sg: ISecurityGroup;
    role: IRole;
}

export class FargateStackEc2 extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & Ec2Props) {
        super(scope, id, props);

        const userData = UserData.forLinux({
            shebang: '#!/bin/bash',
        });
        userData.addCommands(
            "yum update -y",
            "amazon-linux-extras enable postgresql13",
            "yum clean metadata",
            "yum install postgresql.x86_64 python3 -y",
            "pip3 install awscli --upgrade",
        );

        const ec2ManagementInstance = new Instance(this, 'EC2ManagementInstance', {
            instanceName: 'fargate-management-instance',
            instanceType: InstanceType.of(InstanceClass.T3,
                InstanceSize.MICRO),
            machineImage: MachineImage.latestAmazonLinux({
                generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            vpc: props.vpc,
            securityGroup: props.sg,
            role: props.role,
            userData: userData,
            vpcSubnets: props.vpc.selectSubnets({
                subnetGroupName: 'subnet-private-management-',
            }),
        });
        Tags.of(ec2ManagementInstance).add('Name', 'fargate-management-instance');

    }
}