# Push Markdown to Notion

Sync your Markdown documentation between GitHub and Notion automatically. This GitHub Action monitors commits for Markdown changes and syncs them to your Notion workspace, keeping both places in sync.

## Why Use This?

- **Keep Documentation in Sync**: Write in Markdown alongside your code, while ensuring your Notion workspace stays current
- **Developer-Friendly**: Engineers can work in their preferred environment (GitHub) while colleagues can access the same content in Notion
- **Clear Ownership**: Files are clearly marked as synced from GitHub with a link back to the source

## Features

- 🔄 GitHub to Notion syncing
- 🏷️ Supports rich frontmatter for metadata (syncs title, status, version)
- 📊 Properly formats tables and other Markdown elements
- 🔒 Locks documents in Notion with clear indication of source
- ⚡ Handles large documents with API-compliant chunking
- 📈 Tracks sync status (Syncing, Synced, Error)

## Setup

### 1. Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new internal integration
3. Grant it `read`, `update`, and `insert` capabilities
4. Copy the token for the next step

### 2. Configure GitHub Workflow

Create a file at `.github/workflows/sync-notion.yml` with the following content:

```yaml
name: Sync Markdown to Notion

on:
  push:
    branches:
      - main
    paths:
      - '**.md'

jobs:
  push_markdown_job:
    runs-on: ubuntu-latest
    name: Push Markdown to Notion
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - name: Push Markdown to Notion
        uses: rickymarcon/push-md-to-notion@main
        with:
          notion-token: ${{ secrets.NOTION_TOKEN }}
```

### 3. Create Notion Pages

For each Markdown file you want to sync:
1. Create a Notion page
2. Share it with your integration
3. Copy the page link

### 4. Add Frontmatter to Your Markdown

Add the following frontmatter to any Markdown file you want to sync:

```md
---
title: Your Document Title
description: A brief description of the document
status: Draft
authors: Author Name (email@domain.com)
version: 0.1
notion_page: https://www.notion.so/your-page-id
---

# Your Content

Regular Markdown content goes here.
```

Only the `notion_page` field is required, but the `title`, `status`, and `version` fields will update corresponding properties in Notion. The `description` and `authors` fields are included in the frontmatter but not currently synced with Notion properties.

## Properties Supported

| Frontmatter Property | Notion Property Type | Description | Synced |
|----------------------|--------------------|--------------| ------ |
| `title` | Title | Document title (linked to GitHub source) | ✅ |
| `status` | Status | Document status (Draft, Review, etc.) | ✅ |
| `version` | Rich Text | Version number or string | ✅ |
| `description` | N/A | Brief description | ❌ |
| `authors` | N/A | Author names/emails (string or array) | ❌ |
| `notion_page` | N/A | The Notion page URL to sync with (required) | N/A |

## How It Works

1. When you push changes to Markdown files with the proper frontmatter
2. The GitHub action automatically detects the changes
3. It updates the corresponding Notion page, including:
   - Setting the document status to "Syncing..."
   - Updating metadata properties
   - Clearing existing content
   - Adding a warning banner that the content is synced from GitHub
   - Adding all Markdown content, properly formatted
   - Setting the status to "Synced" when complete

## Acknowledgements

This project is forked from [JoshStern/push-md-to-notion](https://github.com/JoshStern/push-md-to-notion) with additional improvements:
- Support for chunking large Markdown documents
- Better status tracking and error handling
- Support for additional frontmatter fields
- Improved GitHub integration
