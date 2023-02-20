import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FargateStackECR } from './fargate-stack-ecr';
import { FargateStackIam } from './fargate-stack-iam';
import { FargateStackSG } from './fargate-stack-sg';
import { FargateStackVpc } from './fargate-stack-vpc';
import { FargateStackVpce } from './fargate-stack-vpce';
import { FargateStackEc2 } from './fartage-stack-ec2';

export class FargateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // network
    const fargatestackvpc = new FargateStackVpc(this, 'VpcStack');

    // SecurityGroup
    const fargatestacksg = new FargateStackSG(this, 'SgStack', fargatestackvpc.fargateVpc);

    // IAM Role
    const fargatestackiam = new FargateStackIam(this, 'IamStack');

    // Vpc Endpoint
    const fargatestackvpce = new FargateStackVpce(this, 'VpceStack', {
      vpc: fargatestackvpc.fargateVpc,
      sg: fargatestacksg.sgVpce,
    });

    // ecr
    const fargatestackecr = new FargateStackECR(this, 'EcrStack');

    // ec2
    const fargatestackec2 = new FargateStackEc2(this, 'Ec2Stack', {
      vpc: fargatestackvpc.fargateVpc,
      sg: fargatestacksg.sgManagement,
      role: fargatestackiam.iamRoleForManagementEc2,
    });

  }
}
