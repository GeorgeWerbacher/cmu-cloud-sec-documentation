# Getting Started with Cloud Security Labs

This guide will help you prepare your environment and get ready to complete the cloud security laboratory series.

## Table of Contents

- [Prerequisites](#prerequisites)
- [AWS Account Setup](#aws-account-setup)
- [Software Installation](#software-installation)
- [Environment Configuration](#environment-configuration)
- [Cost Management](#cost-management)
- [Safety and Security Guidelines](#safety-and-security-guidelines)
- [Next Steps](#next-steps)

## Prerequisites

### Knowledge Requirements

- **Basic Networking**: Understanding of IP addresses, subnets, firewalls, and routing
- **System Administration**: Familiarity with command line operations (Linux/Windows)
- **Security Concepts**: Basic understanding of authentication, authorization, and encryption
- **Cloud Fundamentals**: General understanding of cloud computing concepts (helpful but not required)

### Technical Requirements

- **Operating System**: Windows, macOS, or Linux
- **Internet Connection**: Stable broadband connection for accessing AWS services
- **Web Browser**: Modern browser (Chrome, Firefox, Safari, or Edge)
- **Email Access**: Valid email address for AWS account creation and notifications

### Time Commitment

- **Total Series**: 10-15 hours spread across 4 labs
- **Individual Lab**: 2-4 hours each
- **Flexible Schedule**: Labs can be completed at your own pace
- **Recommended**: Complete one lab per session to maintain focus

## AWS Account Setup

### Account Creation

1. **Navigate to AWS**:
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Click "Create an AWS Account"

2. **Provide Account Information**:
   - Enter your email address
   - Choose a strong password
   - Select an AWS account name

3. **Contact Information**:
   - Provide accurate contact details
   - Choose "Personal" account type for individual learning

4. **Payment Information**:
   - Enter valid credit/debit card information
   - **Note**: Required even for free tier usage, but you won't be charged if you stay within limits

5. **Phone Verification**:
   - Complete SMS or voice verification process

6. **Support Plan Selection**:
   - Choose "Basic Plan" (free) for these labs

### Account Verification

- **Activation Time**: May take a few minutes to several hours
- **Confirmation Email**: Check your email for activation confirmation
- **Initial Sign-In**: Use the AWS Management Console to verify access

### Free Tier Overview

AWS Free Tier provides limited free usage for 12 months:

- **EC2**: 750 hours of t2.micro instances per month
- **S3**: 5 GB of storage, 20,000 GET requests
- **VPC**: VPC and security group usage is free
- **CloudTrail**: One trail with management events
- **CloudWatch**: Basic monitoring and 10 custom metrics

## Software Installation

### AWS CLI (Recommended)

The AWS Command Line Interface provides programmatic access to AWS services.

#### Installation Options:

**Windows**:
```bash
# Using MSI installer
# Download from: https://aws.amazon.com/cli/
# Or using Python pip:
pip install awscli
```

**macOS**:
```bash
# Using Homebrew:
brew install awscli

# Or using Python pip:
pip install awscli
```

**Linux**:
```bash
# Ubuntu/Debian:
sudo apt-get install awscli

# CentOS/RHEL:
sudo yum install awscli

# Or using Python pip:
pip install awscli
```

#### Verify Installation:
```bash
aws --version
```

### Terraform (For Optional IaC Sections)

Terraform enables Infrastructure as Code deployment.

#### Installation Options:

**Windows**:
```bash
# Using Chocolatey:
choco install terraform

# Or download binary from: https://www.terraform.io/downloads
```

**macOS**:
```bash
# Using Homebrew:
brew install terraform
```

**Linux**:
```bash
# Download and install manually:
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

#### Verify Installation:
```bash
terraform --version
```

### SSH Client

Required for connecting to EC2 instances.

- **Windows**: Built-in SSH client (Windows 10+) or PuTTY
- **macOS/Linux**: Built-in SSH client

## Environment Configuration

### AWS CLI Configuration

After installing AWS CLI, configure it with your credentials:

1. **Create IAM User** (completed in Lab 1):
   - Create an IAM user with programmatic access
   - Save the Access Key ID and Secret Access Key

2. **Configure AWS CLI**:
   ```bash
   aws configure
   ```
   
   Provide:
   - **Access Key ID**: Your IAM user's access key
   - **Secret Access Key**: Your IAM user's secret key
   - **Default Region**: `us-east-1` (recommended for labs)
   - **Output Format**: `json`

3. **Verify Configuration**:
   ```bash
   aws sts get-caller-identity
   ```

### Create Working Directory

Create a dedicated directory for lab materials:

```bash
# Create main directory
mkdir cloud-security-labs
cd cloud-security-labs

# Create subdirectories for each lab
mkdir lab1 lab2 lab3 lab4
mkdir terraform-configs
mkdir scripts
```

## Cost Management

### Monitor Your Usage

1. **Enable Billing Alerts**:
   - Follow instructions in Lab 1
   - Set up alerts for $5, $10, and $25

2. **Check AWS Free Tier Usage**:
   - Navigate to Billing & Cost Management
   - View "Free Tier" to monitor usage against limits

3. **Use AWS Pricing Calculator**:
   - Estimate costs before creating resources
   - Available at: [calculator.aws](https://calculator.aws)

### Cost Optimization Tips

- **Instance Types**: Always use t2.micro for labs (free tier eligible)
- **Regions**: Use us-east-1 when possible (often lowest cost)
- **Cleanup**: Always complete cleanup sections after each lab
- **Monitoring**: Check your bill weekly during the lab series

### Emergency Cleanup

If you need to quickly remove all resources:

1. **Terminate EC2 Instances**:
   ```bash
   aws ec2 terminate-instances --instance-ids $(aws ec2 describe-instances --query 'Reservations[].Instances[?State.Name==`running`].InstanceId' --output text)
   ```

2. **Delete VPCs** (after terminating instances):
   ```bash
   aws ec2 describe-vpcs --filters "Name=is-default,Values=false" --query 'Vpcs[].VpcId' --output text | xargs -n1 aws ec2 delete-vpc --vpc-id
   ```

## Safety and Security Guidelines

### Account Security

- **Never share your AWS credentials** with anyone
- **Use MFA** on root account and IAM users
- **Rotate access keys** regularly (at least every 90 days)
- **Follow least privilege principle** when creating IAM policies

### Lab Safety

- **Read instructions carefully** before executing commands
- **Verify regions** - ensure you're working in the correct AWS region
- **Clean up resources** after each lab to avoid charges
- **Don't use production accounts** - use dedicated lab accounts only

### Data Protection

- **Use dummy data** - never upload sensitive or personal information
- **Avoid real passwords** - use generated passwords for lab exercises
- **Clean browser data** when using shared computers

## Troubleshooting Common Issues

### AWS CLI Issues

**Problem**: "AWS CLI not found"
**Solution**: Ensure AWS CLI is in your PATH, restart terminal after installation

**Problem**: "Access denied" errors
**Solution**: Verify IAM user has necessary permissions, check AWS CLI configuration

### Account Access Issues

**Problem**: "Account not activated"
**Solution**: Wait for email confirmation, may take up to 24 hours

**Problem**: "Payment method declined"
**Solution**: Verify card details, contact bank if needed

### Regional Issues

**Problem**: "Service not available in region"
**Solution**: Switch to us-east-1 region, some services have regional limitations

### Free Tier Limits

**Problem**: "Free tier exceeded" warnings
**Solution**: Monitor usage in Billing dashboard, clean up unused resources

## Next Steps

Once you've completed the setup:

1. ✅ **Verify Prerequisites**: Ensure all software is installed and configured
2. ✅ **Test AWS Access**: Confirm you can access the AWS Management Console
3. ✅ **Create Working Directory**: Set up your local lab environment
4. ✅ **Review Safety Guidelines**: Understand cost and security implications
5. 🚀 **Start Lab 1**: Begin with [AWS Account Fundamentals](lab-01-aws-fundamentals.md)

## Getting Help

If you encounter issues during setup:

1. **Check AWS Documentation**: Comprehensive guides for all services
2. **Review Error Messages**: Often contain specific guidance
3. **AWS Support**: Use AWS Support Center for account-related issues
4. **Community Resources**: AWS forums and Stack Overflow

## Useful Commands Reference

### AWS CLI Quick Reference
```bash
# Check current identity
aws sts get-caller-identity

# List EC2 instances
aws ec2 describe-instances

# List S3 buckets
aws s3 ls

# Check current region
aws configure get region

# List available regions
aws ec2 describe-regions --output table
```

### Terraform Quick Reference
```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply

# Destroy resources
terraform destroy
```

---

**Ready to begin?** Start with [Lab 1: AWS Account Fundamentals](lab-01-aws-fundamentals.md)

**Need more help?** Check the [Troubleshooting Guide](resources/troubleshooting.md)