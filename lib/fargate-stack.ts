import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FargateStackEc2 } from './fargate-stack-ec2';
import { FargateStackECR } from './fargate-stack-ecr';
import { FargateStackIam } from './fargate-stack-iam';
import { FargateStackKms } from './fargate-stack-kms';
import { FargateStackRds } from './fargate-stack-rds';
import { FargateStackSG } from './fargate-stack-sg';
import { FargateStackVpc } from './fargate-stack-vpc';
import { FargateStackVpce } from './fargate-stack-vpce';

export class FargateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // network
    const fargatestackvpc = new FargateStackVpc(this, 'VpcStack');

    // SecurityGroup
    const fargatestacksg = new FargateStackSG(this, 'SgStack', {
      vpc: fargatestackvpc.vpc
    });

    // IAM Role
    const fargatestackiam = new FargateStackIam(this, 'IamStack');

    // Vpc Endpoint
    const fargatestackvpce = new FargateStackVpce(this, 'VpceStack', {
      vpc: fargatestackvpc.vpc,
      sg: fargatestacksg.sgVpce,
    });

    // ecr
    const fargatestackecr = new FargateStackECR(this, 'EcrStack');

    // ec2
    const fargatestackec2 = new FargateStackEc2(this, 'Ec2Stack', {
      vpc: fargatestackvpc.vpc,
      sg: fargatestacksg.sgManagement,
      role: fargatestackiam.iamRoleForManagementEc2,
    });

    // kms
    const fargatestackkms = new FargateStackKms(this, 'KmsStack');

    // rds
    const fargatestackrds = new FargateStackRds(this, 'RdsStack', {
      vpc: fargatestackvpc.vpc,
      sg: fargatestacksg.sgRds,
      encKey: fargatestackkms.rdsKey,
    });

  }
}
