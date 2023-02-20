import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';


export class FargateStackIam extends cdk.Stack {
    public readonly iamRoleForManagementEc2: iam.Role;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const iamRoleForManagementEc2 = new iam.Role(this, 'iam-role-management-ec2', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            description: 'IAM role for management EC2 instance',
            managedPolicies: [
                {
                    managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore',
                },
                {
                    managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonS3FullAccess',
                },

            ],
        });
        cdk.Tags.of(iamRoleForManagementEc2).add('Name', 'iam-role-for-management-ec2');

        this.iamRoleForManagementEc2 = iamRoleForManagementEc2;

    }

}