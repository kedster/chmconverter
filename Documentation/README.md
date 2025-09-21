# CHM Converter Documentation

This folder contains comprehensive documentation for the CHM Converter project.

## Documentation Files

### [Core Functionality](CORE_FUNCTIONALITY.md)
Defines exactly what the CHM Converter does and doesn't do, including:
- Executive summary of the tool's purpose
- Detailed use cases and scenarios
- Technical scope and boundaries
- Input/output format specifications
- Operational limitations and constraints

### [Technical Architecture](TECHNICAL_ARCHITECTURE.md) 
Details the internal design and implementation, including:
- System architecture overview
- Component breakdown and responsibilities
- Processing pipeline and data flow
- Key algorithms and pattern recognition
- Browser compatibility and performance characteristics
- Security considerations

### [Dependency Management](DEPENDENCY_MANAGEMENT.md)
Comprehensive guide for maintaining project dependencies and workflows, including:
- Dependency analysis and update strategies
- Security vulnerability management
- CI/CD workflow setup and automation
- Maintenance schedules and best practices
- Emergency update procedures
- Testing and verification processes

### [Maintenance Quick Reference](MAINTENANCE_QUICK_REFERENCE.md)
Essential commands and procedures for day-to-day maintenance:
- Quick reference commands for common tasks
- CI/CD setup checklists
- Emergency procedures
- Useful tools and resources
- Key file locations and support links

## Workflow Templates

The `workflows/` directory contains example GitHub Actions templates:
- **CI/CD Pipeline** - Automated testing and security checks
- **Dependabot Configuration** - Automated dependency updates
- **GitHub Pages Deployment** - Automated site deployment

## Quick Reference

**Primary Purpose**: Extract API class definitions from CHM files and convert to JSON/CSV

**Input**: CHM (Compiled HTML Help) files with ITSF signatures

**Output**: JSON or CSV files containing structured class definition data

**Pattern**: Extracts content matching `Class [ClassName] [Description]` format

**Platform**: Browser-based application (no installation required)

## Getting Started

1. Read [Core Functionality](CORE_FUNCTIONALITY.md) to understand what the tool does
2. Review [Technical Architecture](TECHNICAL_ARCHITECTURE.md) for implementation details  
3. Check [Dependency Management](DEPENDENCY_MANAGEMENT.md) for maintenance procedures
4. Use [Maintenance Quick Reference](MAINTENANCE_QUICK_REFERENCE.md) for daily tasks
5. Return to the main [README](../README.md) for usage instructions