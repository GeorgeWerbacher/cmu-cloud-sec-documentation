# Cloud Security Labs

A comprehensive hands-on laboratory series for learning cloud security concepts, best practices, and implementation techniques using Amazon Web Services (AWS).

## Overview

This laboratory series provides practical, hands-on experience with cloud security fundamentals, advanced identity management, secure networking, and comprehensive security monitoring. Each lab builds upon previous concepts while introducing new security controls and monitoring capabilities.

The labs are designed to provide real-world experience with AWS security services and help you develop the skills needed to secure cloud environments in production scenarios.

## Course Objectives

By completing all four labs, you will be able to:

- Design and implement secure cloud architectures following AWS best practices
- Configure advanced identity and access management with federation capabilities
- Build defense-in-depth network security architectures
- Deploy comprehensive security monitoring and automated incident response systems
- Apply the AWS Shared Responsibility Model to real-world scenarios
- Implement Infrastructure as Code (IaC) for consistent security deployments

## Prerequisites

Before starting these labs, ensure you have:

- **AWS Account**: Personal AWS account with credit/debit card (free tier eligible)
- **Technical Skills**: Basic understanding of networking, system administration, and security concepts
- **Software Requirements**:
  - Modern web browser
  - [AWS CLI](https://aws.amazon.com/cli/) (recommended)
  - [Terraform](https://www.terraform.io/downloads) (for IaC sections)
  - SSH client for connecting to instances
- **Time Commitment**: Each lab requires 2-4 hours to complete
- **Important**: Review [AWS Free Tier limits](https://aws.amazon.com/free/) to avoid unexpected charges

## Lab Series Structure

### [Lab 1: AWS Account Fundamentals](lab-01-aws-fundamentals.md)
**Duration**: 2-3 hours  
**Prerequisites**: None  

Establish your foundation in cloud security by setting up and hardening an AWS account. Learn essential security controls and monitoring.

**Key Topics**:
- AWS account creation and initial security hardening
- Root account protection with MFA
- IAM user creation and permission management
- Billing alerts and cost monitoring
- Introduction to Infrastructure as Code with Terraform

**Learning Outcomes**:
- Secure AWS account following security best practices
- Implement multi-factor authentication
- Configure billing monitoring and alerts
- Deploy basic resources using Terraform (optional)

---

### [Lab 2: Advanced IAM & Federation](lab-02-iam-federation.md)
**Duration**: 3-4 hours  
**Prerequisites**: Completion of Lab 1  

Dive deep into Identity and Access Management, implementing advanced security patterns and centralized identity federation.

**Key Topics**:
- Cloud threat landscape and attack vectors
- AWS Shared Responsibility Model application
- Advanced IAM policies and permission boundaries
- Cross-account access patterns
- AWS Identity Center (SSO) federation
- CloudTrail monitoring and automated remediation

**Learning Outcomes**:
- Implement least privilege access controls
- Configure cross-account access securely
- Set up centralized identity federation
- Create automated security remediation workflows

---

### [Lab 3: Secure AWS Networking](lab-03-secure-networking.md)
**Duration**: 3-4 hours  
**Prerequisites**: Completion of Labs 1-2  

Design and implement secure multi-tier network architectures with comprehensive traffic controls and monitoring.

**Key Topics**:
- Multi-tier VPC architecture design
- Security Groups and Network ACL configuration
- VPC Flow Logs and traffic analysis
- VPC Endpoints and PrivateLink
- Cross-VPC connectivity (Peering and Transit Gateway)
- Bastion host architecture for secure access

**Learning Outcomes**:
- Design defense-in-depth network architectures
- Implement network segmentation and access controls
- Monitor and analyze network traffic
- Configure secure administrative access patterns

---

### [Lab 4: AWS Security Services & Monitoring](lab-04-security-monitoring.md)
**Duration**: 3-4 hours  
**Prerequisites**: Completion of Labs 1-3  

Implement comprehensive security monitoring, threat detection, and automated incident response across your AWS environment.

**Key Topics**:
- CloudTrail comprehensive logging and analysis
- AWS Config for compliance monitoring
- Security Hub for centralized security management
- GuardDuty for intelligent threat detection
- CloudWatch alarms for security events
- EventBridge-based automated incident response
- Systems Manager for secure instance management
- Inspector for vulnerability assessment

**Learning Outcomes**:
- Deploy enterprise-grade security monitoring
- Configure automated threat detection and response
- Implement compliance monitoring and reporting
- Create security incident response playbooks

## Getting Started

### Quick Start Guide

1. **Prepare Your Environment**:
   - Create an AWS account (if you don't have one)
   - Install AWS CLI and configure access
   - Review the [Getting Started Guide](getting-started.md) for detailed setup instructions

2. **Choose Your Learning Path**:
   - **Sequential Learning** (Recommended): Complete labs 1-4 in order
   - **Focused Learning**: Jump to specific topics based on your needs
   - **Terraform Track**: Include all optional Terraform sections for IaC experience

3. **Start with Lab 1**: Begin with [AWS Account Fundamentals](lab-01-aws-fundamentals.md)

### Important Safety Notes

⚠️ **Cost Management**: While these labs are designed to work within AWS Free Tier limits, always monitor your usage and clean up resources after each lab to avoid unexpected charges.

⚠️ **Security**: These labs involve creating and configuring security-sensitive resources. Always follow the cleanup instructions to remove test accounts and configurations.

⚠️ **Production Use**: The configurations in these labs are for educational purposes. Consult AWS security best practices and your security team before implementing similar configurations in production environments.

## Lab Navigation

| Lab | Title | Duration | Difficulty |
|-----|-------|----------|------------|
| [01](lab-01-aws-fundamentals.md) | AWS Account Fundamentals | 2-3 hrs | Beginner |
| [02](lab-02-iam-federation.md) | Advanced IAM & Federation | 3-4 hrs | Intermediate |
| [03](lab-03-secure-networking.md) | Secure AWS Networking | 3-4 hrs | Intermediate |
| [04](lab-04-security-monitoring.md) | Security Services & Monitoring | 3-4 hrs | Advanced |

## Additional Resources

- **[Lab Resources](resources/lab-resources.md)**: Links to AWS documentation, whitepapers, and tools
- **[Troubleshooting Guide](resources/troubleshooting.md)**: Common issues and solutions
- **[Architecture Diagrams](docs/architecture-diagrams.md)**: Visual reference for lab architectures
- **[Glossary](docs/glossary.md)**: Definitions of key terms and concepts
- **[Terraform Examples](resources/terraform-examples/)**: Infrastructure as Code implementations

## Support and Feedback

If you encounter issues while working through these labs:

1. Check the [Troubleshooting Guide](resources/troubleshooting.md) for common solutions
2. Review the relevant AWS documentation links provided in each lab
3. Ensure you're following the cleanup instructions to avoid resource conflicts
4. Contact your course staff for assistance (if in a classroom environment)

## License and Usage

This educational content is designed for learning purposes. Please refer to AWS's terms of service and pricing when using their services. Always clean up resources after completing labs to minimize costs.

---

**Ready to start?** Begin with [Lab 1: AWS Account Fundamentals](lab-01-aws-fundamentals.md)

**Need setup help?** Check out the [Getting Started Guide](getting-started.md)