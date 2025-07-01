# n8n-nodes-inoreader

This is an n8n community node. It lets you use **Inoreader** in your n8n workflows.

Inoreader is a powerful content aggregator and RSS reader platform that lets you monitor, organize, and automate the flow of articles, feeds, and web content. Stay ahead with real-time updates from your favorite websites, blogs, newsletters, and social media – all in one customizable, distraction-free space.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

---

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

---

## Operations

This node supports the following operations:

### Trigger (Inoreader Trigger node)
- New article in feed
- New article in folder
- New article in "Read later" section

### Actions (Inoreader node)
- Create new article in "Read later" section
- Create new article in a tag
- Get many articles from feed
- Get many articles from folder
- Get many articles from tag
- Get many articles from "Read later"
- Assign tag to article
- Assign "Read later" flag to article
- Get all feeds
- Get all tags
- Get all folders

---

## Credentials

To use this node, you need an **Inoreader app** and OAuth2 credentials:

1. Sign up at [Inoreader](https://www.inoreader.com/) if you haven’t already. 
2. Go to the [Inoreader Developer Console](https://www.inoreader.com/preferences/other) and create an app. This requires an Inoreader Pro plan.
3. Copy your **App ID** and **App Key**.
4. In n8n, add new credentials of type **Inoreader OAuth2 API**, and enter your App ID and App Key.
5. Click **Connect** and authorize n8n to access your Inoreader account.

Tokens are managed automatically, and refresh tokens are supported.

---

## Compatibility

- **Minimum n8n version:** 1.0.0
- **Tested with:** n8n 1.43.0 and above
- May not work on legacy n8n versions prior to v1 due to changes in trigger handling and credentials.

---

## Usage

- Add the **Inoreader Trigger** node to start a workflow when a new article appears in a feed, folder, or "Read later".
- Use the **Inoreader** node to execute actions like tagging articles or saving external HTML content as new articles in Inoreader

For general help with n8n, see [Try it out](https://docs.n8n.io/try-it-out/).

---

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Inoreader Developer Documentation](https://www.inoreader.com/developers/)
* [Inoreader](https://www.inoreader.com/)

---

