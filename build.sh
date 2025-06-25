#!/bin/sh
cd /home/n8n-node-inoreader/
npm run build
npm link
cd /root/.n8n/custom/
npm link n8n-nodes-inoreader
cd /home/n8n-node-inoreader/
n8n start
