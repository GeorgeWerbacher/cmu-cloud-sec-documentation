# Troubleshooting Guide

Common issues and solutions for the Cloud Security Labs series.

## Table of Contents

- [Account and Access Issues](#account-and-access-issues)
- [AWS CLI Problems](#aws-cli-problems)
- [Service-Specific Issues](#service-specific-issues)
- [Networking Problems](#networking-problems)
- [Cost and Billing Issues](#cost-and-billing-issues)
- [Terraform Issues](#terraform-issues)
- [General Tips](#general-tips)

---

## Account and Access Issues

### Issue: "Access Denied" Errors

**Symptoms**: Getting access denied errors when trying to perform actions in AWS console or CLI

**Common Causes**:
- Insufficient IAM permissions
- Wrong AWS region
- Incorrect AWS credentials
- MFA required but not provided

**Solutions**:

1. **Check IAM Permissions**:
   ```bash
   # Check your current identity
   aws sts get-caller-identity
   
   # List attached policies for your user
   aws iam list-attached-user-policies --user-name YOUR_USERNAME
   ```

2. **Verify AWS Region**:
   - Ensure you're working in the correct region (preferably us-east-1 for labs)
   - Check region in AWS console (top-right corner)
   - Check CLI region: `aws configure get region`

3. **MFA Issues**:
   - If MFA is required, use temporary credentials:
   ```bash
   aws sts get-session-token --serial-number arn:aws:iam::ACCOUNT:mfa/USERNAME --token-code MFACODE
   ```

### Issue: "Account Not Activated" 

**Symptoms**: Cannot log into AWS console, account shows as not activated

**Solutions**:
1. Check email for AWS verification message
2. Wait up to 24 hours for account activation
3. Contact AWS Support if activation takes longer than 24 hours
4. Verify payment method is valid

### Issue: Root Account Locked

**Symptoms**: Cannot access root account due to MFA device loss

**Solutions**:
1. Contact AWS Support immediately
2. Provide account verification information
3. Follow AWS account recovery process
4. **Prevention**: Always have backup MFA devices configured

---

## AWS CLI Problems

### Issue: AWS CLI Not Found

**Symptoms**: Command not found when running `aws` commands

**Solutions**:

1. **Verify Installation**:
   ```bash
   # Check if AWS CLI is installed
   which aws
   aws --version
   ```

2. **Install AWS CLI** (if not installed):
   
   **macOS**:
   ```bash
   # Using Homebrew
   brew install awscli
   
   # Or using pip
   pip3 install awscli
   ```
   
   **Linux**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install awscli
   
   # CentOS/RHEL
   sudo yum install awscli
   ```
   
   **Windows**:
   - Download MSI installer from AWS website
   - Or use: `pip install awscli`

3. **Fix PATH Issues**:
   ```bash
   # Add to your shell profile (.bashrc, .zshrc, etc.)
   export PATH=$PATH:~/.local/bin
   ```

### Issue: AWS CLI Configuration Problems

**Symptoms**: CLI commands fail with credential errors

**Solutions**:

1. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter: Access Key ID, Secret Access Key, Region, Output format
   ```

2. **Check Configuration**:
   ```bash
   # View current configuration
   aws configure list
   
   # Check credentials file
   cat ~/.aws/credentials
   cat ~/.aws/config
   ```

3. **Alternative: Use Environment Variables**:
   ```bash
   export AWS_ACCESS_KEY_ID=your-access-key
   export AWS_SECRET_ACCESS_KEY=your-secret-key
   export AWS_DEFAULT_REGION=us-east-1
   ```

### Issue: SSL Certificate Errors

**Symptoms**: SSL/TLS certificate verification errors

**Solutions**:

1. **Update CA Certificates**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install ca-certificates
   
   # macOS
   brew upgrade ca-certificates
   ```

2. **Temporary Workaround** (not recommended for production):
   ```bash
   aws configure set default.ca_bundle ""
   ```

---

## Service-Specific Issues

### CloudTrail Issues

**Issue**: CloudTrail logs not appearing

**Solutions**:
1. Verify trail is enabled and actively logging
2. Check S3 bucket permissions and existence
3. Ensure region settings are correct
4. Wait up to 15 minutes for logs to appear

**Issue**: CloudTrail access denied to S3 bucket

**Solutions**:
1. Verify S3 bucket policy allows CloudTrail service
2. Check that bucket is in the same region (for most cases)
3. Review CloudTrail service role permissions

### GuardDuty Issues

**Issue**: GuardDuty not generating findings

**Solutions**:
1. Ensure GuardDuty is enabled in correct region
2. Generate sample findings to test setup
3. Check that sufficient time has passed (may take hours for real findings)
4. Verify CloudTrail and DNS logs are being processed

**Issue**: GuardDuty findings not appearing in Security Hub

**Solutions**:
1. Enable GuardDuty integration in Security Hub
2. Check that both services are in the same region
3. Verify Security Hub is enabled

### VPC and Networking Issues

**Issue**: Cannot connect to EC2 instances

**Solutions**:

1. **Check Security Group Rules**:
   ```bash
   # List security groups
   aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
   ```
   - Ensure SSH (port 22) is allowed from your IP
   - Verify HTTP/HTTPS ports if needed

2. **Check Network ACLs**:
   - Ensure NACLs allow required traffic
   - Remember NACLs are stateless (need both inbound and outbound rules)

3. **Verify Route Tables**:
   - Ensure proper routes to internet gateway or NAT gateway
   - Check subnet associations

4. **Instance-Level Issues**:
   - Verify instance is running
   - Check if instance has public IP (for public subnets)
   - Ensure SSH key pair is correct

### EC2 Issues

**Issue**: "Key pair not found" when launching instances

**Solutions**:
1. Create a new key pair in the correct region
2. Import existing key pair if you have the public key
3. Use the correct key pair name (case-sensitive)

**Issue**: Instance fails to launch

**Solutions**:
1. Check service limits for your account
2. Verify AMI is available in your region
3. Ensure sufficient capacity in chosen availability zone
4. Check that instance type is supported

---

## Networking Problems

### Issue: VPC Flow Logs Not Working

**Solutions**:
1. Verify IAM role has correct permissions for Flow Logs
2. Check CloudWatch log group exists and is in correct region
3. Ensure VPC/subnet/ENI still exists
4. Wait up to 10 minutes for initial logs to appear

### Issue: VPC Endpoints Not Working

**Solutions**:
1. Verify endpoint policy allows required actions
2. Check route table has route to endpoint
3. Ensure DNS resolution is enabled in VPC
4. Verify security groups allow HTTPS traffic (port 443)

### Issue: NAT Gateway Connectivity Problems

**Solutions**:
1. Ensure NAT Gateway has Elastic IP
2. Verify route table for private subnet routes to NAT Gateway
3. Check security groups allow outbound internet traffic
4. Ensure NAT Gateway is in public subnet with internet gateway route

---

## Cost and Billing Issues

### Issue: Unexpected AWS Charges

**Immediate Actions**:
1. Check AWS Billing Dashboard
2. Review AWS Cost Explorer for detailed breakdown
3. Stop/terminate running instances immediately
4. Delete unused resources (Load Balancers, NAT Gateways, Elastic IPs)

**Common Culprits**:
- NAT Gateways ($45/month each)
- Application Load Balancers ($16/month each)
- Elastic IPs not attached to running instances
- EC2 instances running in expensive regions
- Data transfer charges

**Prevention**:
```bash
# Quick cleanup script
#!/bin/bash

# Terminate all EC2 instances
aws ec2 terminate-instances --instance-ids $(aws ec2 describe-instances --query 'Reservations[].Instances[?State.Name==`running`].InstanceId' --output text)

# Delete NAT Gateways
for nat in $(aws ec2 describe-nat-gateways --query 'NatGateways[?State==`available`].NatGatewayId' --output text); do
    aws ec2 delete-nat-gateway --nat-gateway-id $nat
done

# Release unattached Elastic IPs
for eip in $(aws ec2 describe-addresses --query 'Addresses[?AssociationId==null].AllocationId' --output text); do
    aws ec2 release-address --allocation-id $eip
done
```

### Issue: Free Tier Limits Exceeded

**Solutions**:
1. Monitor usage in AWS Billing Dashboard
2. Set up billing alerts for low amounts ($1, $5)
3. Use only t2.micro instances
4. Limit running time of resources
5. Delete resources immediately after labs

---

## Terraform Issues

### Issue: Terraform State Lock

**Symptoms**: Error about state being locked

**Solutions**:
```bash
# Force unlock (use carefully!)
terraform force-unlock LOCK_ID

# Or delete .terraform/ directory and re-init
rm -rf .terraform/
terraform init
```

### Issue: Resource Already Exists

**Symptoms**: Error that AWS resource already exists

**Solutions**:
1. Import existing resource:
   ```bash
   terraform import aws_instance.example i-1234567890abcdef0
   ```

2. Or remove from AWS manually and retry

3. Use unique names for resources:
   ```hcl
   resource "aws_s3_bucket" "example" {
     bucket = "my-unique-bucket-${random_string.suffix.result}"
   }
   
   resource "random_string" "suffix" {
     length  = 8
     special = false
     upper   = false
   }
   ```

### Issue: Terraform Destroy Fails

**Solutions**:
1. Check for dependencies (delete dependent resources first)
2. Use targeted destroy:
   ```bash
   terraform destroy -target=aws_instance.example
   ```
3. Manual cleanup in AWS console then:
   ```bash
   terraform refresh
   terraform destroy
   ```

---

## General Tips

### Best Practices for Labs

1. **Always work in us-east-1 region** (most services available, often lowest cost)
2. **Use consistent naming conventions** (helps with organization and cleanup)
3. **Tag all resources** with identifiable labels
4. **Clean up immediately after each lab** (don't wait)
5. **Monitor costs daily** during lab exercises
6. **Take screenshots** of important configurations for reference

### Debugging Approach

1. **Check the obvious first**:
   - Correct region?
   - Correct credentials?
   - Service enabled?
   - Recent AWS outages?

2. **Read error messages carefully**:
   - AWS error messages often contain specific guidance
   - Look for error codes and search AWS documentation

3. **Check AWS Service Health Dashboard**:
   - Visit [status.aws.amazon.com](https://status.aws.amazon.com)
   - Verify no ongoing service issues in your region

4. **Enable detailed logging**:
   ```bash
   # Enable AWS CLI debug output
   aws --debug ec2 describe-instances
   ```

### When to Contact Support

**Contact AWS Support when**:
- Account access issues that can't be resolved
- Billing disputes or unexpected charges
- Service limits need to be increased
- Suspected security issues

**Don't contact support for**:
- General "how-to" questions (use documentation)
- Lab-specific troubleshooting
- Basic configuration issues

### Emergency Resource Cleanup

If you need to quickly stop all charges:

```bash
#!/bin/bash
# Emergency cleanup script - USE WITH CAUTION

# Terminate all EC2 instances
aws ec2 describe-instances --query 'Reservations[].Instances[?State.Name!=`terminated`].InstanceId' --output text | xargs -r aws ec2 terminate-instances --instance-ids

# Delete all custom VPCs (will fail if resources exist)
aws ec2 describe-vpcs --filters "Name=is-default,Values=false" --query 'Vpcs[].VpcId' --output text | xargs -r -I {} aws ec2 delete-vpc --vpc-id {}

# Release unattached Elastic IPs
aws ec2 describe-addresses --query 'Addresses[?AssociationId==null].AllocationId' --output text | xargs -r -I {} aws ec2 release-address --allocation-id {}

# Delete NAT Gateways
aws ec2 describe-nat-gateways --filter "Name=state,Values=available" --query 'NatGateways[].NatGatewayId' --output text | xargs -r -I {} aws ec2 delete-nat-gateway --nat-gateway-id {}
```

---

## Still Need Help?

If you've tried the solutions above and still have issues:

1. **Check AWS Documentation** - Often has the most up-to-date solutions
2. **Search AWS Forums** - [repost.aws](https://repost.aws)
3. **Review AWS Status** - [status.aws.amazon.com](https://status.aws.amazon.com)
4. **Contact course staff** - If in a classroom environment
5. **AWS Support** - For account and billing issues

Remember: Most issues are common and have been solved before. Take time to read error messages carefully and search for specific error codes.