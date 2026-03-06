# GrantsApp — Project Explanation

## Overview

**GrantsApp** is a full-lifecycle grants creation and management platform designed to help ecosystems launch, operate, and scale grant programs without building custom infrastructure.

Many blockchain ecosystems distribute funding through grants to support developers, researchers, and public goods. However, most grant programs rely on fragmented tooling such as forms, spreadsheets, and manual review processes, or require custom smart contract development.

GrantsApp provides a shared infrastructure layer for operating grants programs end-to-end, from program creation and application management to funding allocation and impact tracking.

Inspired by existing platforms such as Gitcoin Grants Stack, Questbook, KarmaHQ, Superteam Earn, and NEAR Protocol’s Nearn platform, GrantsApp aims to generalize and extend these ideas into a flexible system capable of supporting multiple funding mechanisms across different ecosystems.

The long-term vision is to build **shared infrastructure for programmable capital allocation**, allowing organizations, DAOs, and ecosystems to operate funding programs using configurable mechanisms and transparent workflows.

----------

# Problem

Grant programs are one of the primary ways ecosystems fund innovation, but today they are difficult to operate efficiently.

Common challenges include:

**Fragmented tooling**

Many grant programs rely on a mix of tools such as:

-   Google Forms
    
-   Airtable
    
-   Notion
    
-   spreadsheets
    
-   Discord coordination
    

These tools do not provide a unified workflow for managing applications, reviews, and funding decisions.

**Custom infrastructure**

Many ecosystems build their own grant management systems from scratch, which requires engineering resources and results in duplicated effort across ecosystems.

**Limited transparency**

Traditional grant processes often lack transparent decision-making, funding history, and impact tracking.

**Mechanism limitations**

Most platforms support only a single funding mechanism, even though different mechanisms are optimal for different situations.

----------

# Key Insight

No single funding mechanism is optimal for all funding scenarios.

Healthy ecosystems use **plural funding mechanisms** to support different stages of project development and different types of contributors.

Examples include:

-   Direct grants for early-stage projects
    
-   Quadratic funding for community-driven public goods
    
-   Retroactive funding for proven impact
    
-   Milestone-based grants for accountability
    

Grant programs therefore require flexible infrastructure capable of supporting multiple allocation strategies.

----------

# Solution

GrantsApp provides a **no-code platform for creating and operating grant programs using multiple funding mechanisms**.

It serves as the application layer on top of programmable capital allocation primitives, translating funding mechanisms into user-friendly workflows.

Using GrantsApp, ecosystems can launch and manage grant programs without writing smart contracts or building custom internal tooling.

The platform enables the full lifecycle of grants management, including:

-   grant program creation and configuration
    
-   project discovery and applications
    
-   community participation and funding
    
-   grant allocation and distribution
    
-   milestone tracking and reporting
    
-   impact verification and reputation building
    

----------

# What GrantsApp Enables

### Program Managers

Organizations and ecosystems can create and operate grant programs using configurable workflows and funding mechanisms.

Managers can:

-   create grant programs
    
-   configure eligibility criteria
    
-   define timelines and application requirements
    
-   review applications
    
-   allocate funding
    
-   track grantee progress and outcomes
    

----------

### Builders and Project Teams

Builders can create persistent project profiles that act as reusable funding identities.

Builders can:

-   apply to multiple grant programs
    
-   track application status
    
-   manage milestones and deliverables
    
-   build a verifiable funding and impact history over time
    

----------

### Community Members

Community members can participate in funding processes by:

-   discovering grant programs
    
-   exploring projects
    
-   contributing funds
    
-   participating in allocation mechanisms such as quadratic funding
    

----------

### Ecosystem Partners

Protocol foundations, DAOs, and organizations can operate branded grant programs using shared infrastructure rather than building custom systems.

----------

# Core Platform Components

## Program Manager Dashboard

A management interface where program operators create and manage grant programs.

Features include:

-   program creation and configuration
    
-   funding pool management
    
-   application review
    
-   timeline management
    
-   reviewer roles and permissions
    
-   activity history and analytics
    

Example routes:

```
/dashboard
/dashboard/programs
/dashboard/applications
/dashboard/reviews
/dashboard/team-settings
/dashboard/activity

```

----------

## Grants Explorer

A public interface where users can browse active and past grant programs.

Features include:

-   filtering by status, grant type, and eligibility
    
-   viewing program details
    
-   accessing application forms
    

Example route:

```
/grants

```

----------

## Projects Explorer

A discovery interface for exploring projects that have applied to or received grants.

Users can:

-   browse projects
    
-   view funding history
    
-   discover open-source work
    
-   donate or support projects
    

Example route:

```
/projects

```

----------

## Builder Profiles

Persistent profiles for project teams.

Profiles display:

-   project information
    
-   grant applications
    
-   funding history
    
-   milestone completion
    
-   ecosystem contributions
    

These profiles form a **reusable funding reputation layer**.

----------

## Program Manager Profiles

Public profiles for organizations operating grant programs.

These profiles allow communities to view:

-   active programs
    
-   historical grant rounds
    
-   funded projects
    
-   ecosystem contributions
    

----------

# Funding Mechanisms

GrantsApp is designed to support multiple allocation mechanisms over time.

Initial mechanisms may include:

-   Direct grants
    
-   Milestone-based grants
    

Future mechanisms may include:

-   Quadratic funding
    
-   Retroactive funding
    
-   Streaming grants
    
-   Attestation-based funding
    
-   Bounty programs
    

Mechanisms can be configured per program or per funding round.

----------

# Attestation and Reputation Layer

GrantsApp may integrate with Ethereum Attestation Service to create verifiable impact records.

Attestations can represent:

-   milestone completion
    
-   grant delivery
    
-   ecosystem contributions
    
-   verified impact
    

These attestations help create a transparent reputation system for builders and projects.

----------

# Technology Stack

The platform will initially be built using Web2 infrastructure to enable rapid development and iteration.

Initial stack may include:

-   frontend web application
    
-   backend APIs
    
-   hosted database
    
-   authentication and identity management
    

After the core application is complete, components can progressively integrate with Web3 infrastructure.

Potential integrations include:

-   Filecoin for decentralized storage
    
-   Filecoin Virtual Machine for programmable funding contracts
    
-   Ethereum Attestation Service for verifiable impact attestations
    

This approach allows the platform to first establish a complete product experience before introducing onchain components.

----------

# Vision

The long-term vision for GrantsApp is to become a shared infrastructure layer for funding ecosystems.

Instead of every ecosystem building its own grant tooling, GrantsApp can provide a standardized platform for operating capital allocation programs across communities.

Over time, the platform could support:

-   multiple funding mechanisms
    
-   programmable allocation strategies
    
-   interoperable reputation systems
    
-   cross-ecosystem funding discovery
    

In this vision, GrantsApp becomes part of the broader infrastructure for **programmable capital allocation and public goods funding in decentralized ecosystems.**

----------

# Hackathon MVP Scope

For the hackathon, the focus will be building a working prototype that demonstrates the full lifecycle of a grant program using a simple mechanism.

The MVP may include:

-   grant program creation
    
-   application submission
    
-   application review
    
-   funding allocation
    
-   milestone tracking
    
-   public grant and project explorers
    

This demonstrates the core platform workflow while leaving room to expand mechanisms and onchain integrations in future iterations.

----------