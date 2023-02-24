import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class FargateStackIam extends Stack {
    public readonly iamRoleForManagementEc2: Role;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const iamRoleForManagementEc2 = new Role(this, 'iam-role-management-ec2', {
            assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
            description: 'IAM role for management EC2 instance',
            managedPolicies: [
                {
                    managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore',
                },
                {
                    managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonS3FullAccess',
                },

            ],
            roleName: 'role-fargate-management-ec2',
        });
        Tags.of(iamRoleForManagementEc2).add('Name', 'iam-role-for-management-ec2');

        this.iamRoleForManagementEc2 = iamRoleForManagementEc2;

    }

}