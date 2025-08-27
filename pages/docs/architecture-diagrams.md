# Architecture Diagrams

Visual reference for the architectures built throughout the Cloud Security Labs series.

## Table of Contents

- [Lab 1: Basic AWS Account Architecture](#lab-1-basic-aws-account-architecture)
- [Lab 2: Advanced IAM Architecture](#lab-2-advanced-iam-architecture)
- [Lab 3: Secure VPC Architecture](#lab-3-secure-vpc-architecture)
- [Lab 4: Security Monitoring Architecture](#lab-4-security-monitoring-architecture)
- [Complete Architecture Overview](#complete-architecture-overview)

---

## Lab 1: Basic AWS Account Architecture

### Initial Account Setup
```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Account                               │
│                                                                 │
│  ┌─────────────┐                    ┌─────────────┐            │
│  │ Root User   │                    │   Billing   │            │
│  │ ┌─────────┐ │                    │   Alerts    │            │
│  │ │   MFA   │ │                    └─────────────┘            │
│  │ └─────────┘ │                                               │
│  └─────────────┘                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     IAM                                 │   │
│  │                                                         │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │   │
│  │  │ Admin User  │    │   Policies  │    │  MFA Device │ │   │
│  │  │             │    │ ┌─────────┐ │    │             │ │   │
│  │  │ Console +   │────│ │ Admin   │ │    │  Virtual    │ │   │
│  │  │ Programmatic│    │ │ Access  │ │    │ Authenticator│ │   │
│  │  │ Access      │    │ └─────────┘ │    │             │ │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  CloudWatch                             │   │
│  │                                                         │   │
│  │  ┌─────────────┐              ┌─────────────┐          │   │
│  │  │   Billing   │              │     SNS     │          │   │
│  │  │    Alarm    │──────────────│    Topic    │          │   │
│  │  │  (> $5.00)  │              │ (Email Alert)│         │   │
│  │  └─────────────┘              └─────────────┘          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Components**:
- Secure root account with MFA
- Administrative IAM user with programmatic access
- Billing monitoring and alerting
- Foundation for advanced configurations

---

## Lab 2: Advanced IAM Architecture

### Identity Federation and Cross-Account Access
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Primary AWS Account                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           AWS Identity Center                           │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │Administrators│  │ Developers  │  │  Auditors   │  │ Permission  │   │   │
│  │  │   Group     │  │   Group     │  │   Group     │  │    Sets     │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │         │                │                │                │          │   │
│  │         └────────────────┼────────────────┼────────────────┘          │   │
│  │                          │                │                           │   │
│  └──────────────────────────┼────────────────┼───────────────────────────┘   │
│                             │                │                               │
│                             ▼                ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                              IAM                                       │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │Security     │  │ Developer   │  │Cross-Account│  │ Permission  │   │   │
│  │  │Auditor      │  │   Policy    │  │    Role     │  │ Boundary    │   │   │
│  │  │Policy       │  │             │  │             │  │             │   │   │
│  │  │(Read-Only)  │  │(Environment │  │(AssumeRole) │  │(Max Limits) │   │   │
│  │  └─────────────┘  │ Specific)   │  └─────────────┘  └─────────────┘   │   │
│  │                   └─────────────┘         │                          │   │
│  │                                           │                          │   │
│  └───────────────────────────────────────────┼──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             Secondary AWS Account                               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                              IAM                                       │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                 Cross-Account Role                              │   │   │
│  │  │                                                                 │   │   │
│  │  │  Trust Policy: Primary Account                                  │   │   │
│  │  │  Permissions: ReadOnlyAccess                                    │   │   │
│  │  │  MFA Required: Yes                                              │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### CloudTrail Monitoring and Automated Response
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CloudTrail Event Processing                             │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ CloudTrail  │───▶│     S3      │───▶│ CloudWatch  │───▶│ EventBridge │      │
│  │   Events    │    │   Bucket    │    │Log Insights │    │    Rules    │      │
│  │             │    │  (Encrypted)│    │ & Alarms    │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │
│                                               │                   │             │
│                                               ▼                   ▼             │
│                                    ┌─────────────┐    ┌─────────────────┐      │
│                                    │     SNS     │    │     Lambda      │      │
│                                    │    Topic    │    │   Remediation   │      │
│                                    │   (Alerts)  │    │   Function      │      │
│                                    └─────────────┘    └─────────────────┘      │
│                                                              │                 │
│                                                              ▼                 │
│                                                   ┌─────────────────┐          │
│                                                   │  Automated      │          │
│                                                   │  Actions:       │          │
│                                                   │  • Disable Keys │          │
│                                                   │  • Block IPs    │          │
│                                                   │  • Alert Teams  │          │
│                                                   └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Lab 3: Secure VPC Architecture

### Multi-Tier VPC Design
```
                               Internet
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Internet       │
                        │  Gateway        │
                        └─────────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │                           │
                   ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ Public Subnet   │         │ Public Subnet   │
        │   (Web Tier)    │         │   (Bastion)     │
        │  10.0.1.0/24    │         │  10.0.2.0/24    │
        │                 │         │                 │
        │ ┌─────────────┐ │         │ ┌─────────────┐ │
        │ │ Web Server  │ │         │ │ Bastion     │ │
        │ │   (HTTP/S)  │ │         │ │    Host     │ │
        │ └─────────────┘ │         │ └─────────────┘ │
        └─────────────────┘         └─────────────────┘
                   │                           │
                   ▼                           │
        ┌─────────────────┐                    │
        │  NAT Gateway    │                    │
        │ (Outbound Only) │                    │
        └─────────────────┘                    │
                   │                           │
                   ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ Private Subnet  │         │ Private Subnet  │
        │   (App Tier)    │         │  (Data Tier)    │
        │  10.0.3.0/24    │         │  10.0.4.0/24    │
        │                 │         │                 │
        │ ┌─────────────┐ │         │ ┌─────────────┐ │
        │ │Application  │◄─────────▶│ │  Database   │ │
        │ │   Server    │ │         │ │   Server    │ │
        │ └─────────────┘ │         │ └─────────────┘ │
        └─────────────────┘         └─────────────────┘
```

### Security Controls Layer
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Security Controls                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           Network ACLs                                 │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │   Public    │  │   Public    │  │  Private    │  │  Private    │   │   │
│  │  │    NACL     │  │    NACL     │  │    NACL     │  │    NACL     │   │   │
│  │  │(Web Rules)  │  │(SSH Rules)  │  │(VPC Rules)  │  │(DB Rules)   │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         Security Groups                                │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │  WebTier-SG │  │ Bastion-SG  │  │ AppTier-SG  │  │ DataTier-SG │   │   │
│  │  │             │  │             │  │             │  │             │   │   │
│  │  │HTTP: 0.0.0.0│  │SSH: Your IP │  │8080: Web-SG │  │3306: App-SG │   │   │
│  │  │HTTPS:0.0.0.0│  │             │  │SSH: Bastion │  │SSH: Bastion │   │   │
│  │  │SSH: Bastion │  │             │  │             │  │             │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         VPC Flow Logs                                  │   │
│  │                                                                         │   │
│  │  ┌─────────────────────┐              ┌─────────────────────┐         │   │
│  │  │     VPC Traffic     │──────────────│   CloudWatch Logs   │         │   │
│  │  │     Monitoring      │              │     (Aggregated)    │         │   │
│  │  └─────────────────────┘              └─────────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### VPC Endpoints and Private Connectivity
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VPC (10.0.0.0/16)                                    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Private Subnets                                 │   │
│  │                                                                         │   │
│  │  ┌─────────────┐              ┌─────────────────────┐                  │   │
│  │  │Application  │              │    VPC Endpoints    │                  │   │
│  │  │  Servers    │──────────────│                     │                  │   │
│  │  │             │              │  ┌─────────────────┐│                  │   │
│  │  │ AWS API     │              │  │ S3 Gateway      ││                  │   │
│  │  │ Calls       │              │  │ Endpoint        ││                  │   │
│  │  └─────────────┘              │  └─────────────────┘│                  │   │
│  │                               │                     │                  │   │
│  │                               │  ┌─────────────────┐│                  │   │
│  │                               │  │ SSM Interface   ││                  │   │
│  │                               │  │ Endpoints       ││                  │   │
│  │                               │  │ • ssm           ││                  │   │
│  │                               │  │ • ssmmessages   ││                  │   │
│  │                               │  │ • ec2messages   ││                  │   │
│  │                               │  └─────────────────┘│                  │   │
│  │                               └─────────────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│                               No Internet Gateway                               │
│                           ┌─────────────────────────┐                         │
│                           │   Private Communication │                         │
│                           │        to AWS APIs      │                         │
│                           └─────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Lab 4: Security Monitoring Architecture

### Comprehensive Security Monitoring
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Security Monitoring Stack                               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       Data Collection Layer                            │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │ CloudTrail  │  │ VPC Flow    │  │   Config    │  │  GuardDuty  │   │   │
│  │  │   (API      │  │   Logs      │  │ (Resource   │  │ (Threat     │   │   │
│  │  │  Activity)  │  │ (Network    │  │ Changes)    │  │ Detection)  │   │   │
│  │  │             │  │ Traffic)    │  │             │  │             │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │          │               │               │               │            │   │
│  └──────────┼───────────────┼───────────────┼───────────────┼────────────┘   │
│             │               │               │               │                │
│             ▼               ▼               ▼               ▼                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   Processing & Analysis Layer                          │   │
│  │                                                                         │   │
│  │  ┌─────────────┐              ┌─────────────────────────────────────┐   │   │
│  │  │ CloudWatch  │              │           Security Hub              │   │   │
│  │  │             │              │                                     │   │   │
│  │  │• Log Groups │              │  ┌─────────────┐ ┌─────────────┐   │   │   │
│  │  │• Metrics    │              │  │   Findings  │ │ Compliance  │   │   │   │
│  │  │• Alarms     │◄─────────────│  │ Aggregation │ │  Standards  │   │   │   │
│  │  │• Dashboards │              │  └─────────────┘ └─────────────┘   │   │   │
│  │  └─────────────┘              │                                     │   │   │
│  │                               │  ┌─────────────┐ ┌─────────────┐   │   │   │
│  │                               │  │   CIS       │ │  AWS FSBP   │   │   │   │
│  │                               │  │ Benchmark   │ │  Standard   │   │   │   │
│  │                               │  └─────────────┘ └─────────────┘   │   │   │
│  │                               └─────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                       │
│                                       ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     Response & Notification Layer                      │   │
│  │                                                                         │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │   │
│  │  │ EventBridge │───▶│   Lambda    │───▶│     SNS     │                │   │
│  │  │   Rules     │    │  Functions  │    │  Notifications │             │   │
│  │  │             │    │             │    │              │                │   │
│  │  │• Security   │    │• Analyze    │    │• Email       │                │   │
│  │  │  Group      │    │  Events     │    │• Slack       │                │   │
│  │  │  Changes    │    │• Auto       │    │• PagerDuty   │                │   │
│  │  │• Root       │    │  Remediate  │    │• Teams       │                │   │
│  │  │  Usage      │    │• Generate   │    │              │                │   │
│  │  │• Failed     │    │  Reports    │    │              │                │   │
│  │  │  Logins     │    │             │    │              │                │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Incident Response Workflow
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        Incident Response Workflow                               │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Event     │───▶│  Detection  │───▶│ Assessment  │───▶│  Response   │      │
│  │ Generation  │    │ & Alerting  │    │ & Analysis  │    │ & Recovery  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                                                 │
│  Examples:           Examples:           Examples:           Examples:          │
│  • Unusual API      • CloudWatch        • Lambda           • Disable keys     │
│    activity          alarms             function           • Block IPs        │
│  • Config rule      • GuardDuty         analysis          • Notify teams     │
│    violations        findings          • Security Hub     • Create tickets   │
│  • Failed logins    • Security Hub     dashboard         • Document         │
│  • SG changes        alerts           • Manual review      incident        │
│                     • SNS             • Threat hunting   • Post-mortem     │
│                       notifications                                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Automation Levels                               │   │
│  │                                                                         │   │
│  │  Level 1: Notification Only                                            │   │
│  │  ├── Send alerts to security team                                      │   │
│  │  └── Log incident for manual review                                    │   │
│  │                                                                         │   │
│  │  Level 2: Semi-Automated Response                                      │   │
│  │  ├── Automatic initial containment                                     │   │
│  │  ├── Human approval for further actions                                │   │
│  │  └── Guided remediation workflows                                      │   │
│  │                                                                         │   │
│  │  Level 3: Fully Automated Response                                     │   │
│  │  ├── Immediate containment actions                                     │   │
│  │  ├── Automatic remediation                                             │   │
│  │  └── Post-incident analysis and learning                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Architecture Overview

### End-to-End Security Architecture
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Complete AWS Security Stack                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          Identity Layer                                 │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │    Root     │  │ IAM Users & │  │   Identity  │  │Cross-Account│   │   │
│  │  │  Account    │  │   Roles     │  │   Center    │  │   Access    │   │   │
│  │  │    (MFA)    │  │    (MFA)    │  │   (SSO)     │  │  (AssumeRole│   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                       │
│                                       ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         Network Layer                                  │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │    VPCs     │  │ Subnets &   │  │ Security    │  │    VPC      │   │   │
│  │  │(Multi-tier) │  │ Route       │  │ Groups &    │  │  Endpoints  │   │   │
│  │  │             │  │ Tables      │  │   NACLs     │  │             │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                       │
│                                       ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       Compute Layer                                    │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │    EC2      │  │  Systems    │  │   Session   │  │   Inspector │   │   │
│  │  │ Instances   │  │   Manager   │  │   Manager   │  │(Vulnerability)│   │   │
│  │  │ (Hardened)  │  │  (Patching) │  │ (Secure SSH)│  │  Assessment  │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                       │
│                                       ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     Monitoring Layer                                   │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │ CloudTrail  │  │    Config   │  │ Security Hub│  │  GuardDuty  │   │   │
│  │  │(All Regions)│  │ (Compliance)│  │ (Central    │  │ (Threat     │   │   │
│  │  │             │  │             │  │  Dashboard) │  │ Detection)  │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                       │
│                                       ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     Response Layer                                     │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │ CloudWatch  │  │ EventBridge │  │   Lambda    │  │     SNS     │   │   │
│  │  │   Alarms    │  │   Rules     │  │  Functions  │  │ Notifications│   │   │
│  │  │             │  │             │  │(Auto-Remedy)│  │   & Teams   │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

Throughout all labs, we implement these key security architecture principles:

### Defense in Depth
- **Multiple Security Layers**: Network ACLs + Security Groups + IAM policies
- **Redundant Controls**: Multiple ways to detect and prevent threats
- **Fail-Safe Defaults**: Deny by default, allow by exception

### Least Privilege Access
- **Minimal Required Permissions**: Users/services get only what they need
- **Time-Limited Access**: Sessions expire, require re-authentication
- **Just-in-Time Access**: Elevate privileges only when needed

### Continuous Monitoring
- **Real-Time Detection**: GuardDuty and CloudWatch monitoring
- **Historical Analysis**: CloudTrail logs for forensic investigation
- **Compliance Checking**: AWS Config rules for continuous compliance

### Automated Response
- **Immediate Containment**: Auto-disable compromised credentials
- **Notification Systems**: Alert security teams immediately
- **Documentation**: Automatic incident logging and reporting

### Secure by Design
- **Encrypted Storage**: All data encrypted at rest and in transit
- **Private Networks**: Minimize public exposure
- **Immutable Infrastructure**: Infrastructure as Code for consistency

---

**Note**: These diagrams use ASCII art for maximum compatibility. For production documentation, consider using tools like:
- [Lucidchart](https://www.lucidchart.com/)
- [Draw.io](https://app.diagrams.net/)
- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
- [Cloudcraft](https://www.cloudcraft.co/) (AWS-specific)