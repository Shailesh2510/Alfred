# Alfred Concierge

Alfred Concierge is an AI-powered chatbot system designed to assist users with airport transfer bookings and food orders. It leverages the LangChain framework, OpenAI, and a Slack-based human validation workflow, with state management using Postgres. The modular agent-based architecture ensures scalability and maintainability.

## Features

- **Airport Transfer Agent**: Handles multi-step ride booking (collecting details, fetching options, and confirming bookings).
- **Food Order Agent**: Provides a URL for placing food orders.
- **Fallback Agent**: Manages unrecognized queries with helpful responses.
- **Human Validation**: Integrates with Slack for manual approval of agent responses.
- **State Persistence**: Uses Postgres for session state management.
- **Extensible Workflow**: Built with LangGraph for flexible conversation flows.

## Prerequisites

- **Python 3.11 or higher**
- **Docker** (for deployment)
- **uv** (optional, for dependency management)
- **Git** (for cloning the repository)
- **Slack Workspace** (with a configured webhook and bot token - [setup instructions](SetupSlackBot.md)). Bot setup is one time activity, channel should be one per developer.
- **OpenAI API Key**
- **PostgreSQL** (for database operations)
- **Langfuse Account** (for tracing and logging)

## Development

### Clone the Repository

```sh
 git clone https://github.com/Alfred-Technologies/concierge-agent.git
```

### Set Up Environment

Create `.env` file and update your settings

```sh
cd src
cp .env.example .env
```

Install dependencies:

```sh
cd src
uv sync
```

### Start Redis & PostgreSQL

Ensure Docker is running, then run the docker-compose command:

```sh
docker compose up -d
```

The Docker Compose configuration:

- Creates PostgreSQL services with persistent volumes
- Uses environment variables from `.env` file with fallback values
- Maps the ports specified in your settings
- Includes healthchecks for both services
- Sets restart: `unless-stopped` for both containers

### Running the System

```sh
cd src
uv run workflow.py
```

Approve the response in Slack using action buttons

### Connection Issues

- Verify Slack webhook URL is correct.
- Check PostgreSQL connection: `psql -h localhost -U postgres -d postgres`.
- Verify Langfuse API key and project configuration.

## Debugging

- View Langfuse traces for detailed execution logs: `https://us.cloud.langfuse.com/`.

## Cleanup

- Stop the process: `Ctrl+C`
---
