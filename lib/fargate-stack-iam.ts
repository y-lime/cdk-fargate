import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { IRole, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class FargateStackIam extends Stack {
    public readonly iamRoleForManagementEc2: IRole;
    public readonly iamRoleEcsTaskExec: IRole;
    public readonly iamRoleEcsTask: IRole;

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

        const iamRoleEcsTask = new Role(this, 'iam-role-ecs-task', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: 'role-fargate-ecs-task',
            managedPolicies: [
                {
                    managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonS3FullAccess',
                },
            ],
        });
        Tags.of(iamRoleEcsTask).add('Name', 'iam-role-for-ecs-task');
        this.iamRoleEcsTask = iamRoleEcsTask;

        const iamRoleEcsTaskExec = new Role(this, 'iam-role-ecs-taskexec', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: 'role-fargate-ecs-taskexec',
            managedPolicies: [
                {
                    managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
                },
            ],
        });
        Tags.of(iamRoleEcsTaskExec).add('Name', 'iam-role-ecs-taskexec');
        this.iamRoleEcsTaskExec = iamRoleEcsTaskExec;
    }

}