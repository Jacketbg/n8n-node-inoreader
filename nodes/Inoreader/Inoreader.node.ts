import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IRequestOptions,
} from 'n8n-workflow';

export class Inoreader implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Inoreader',
		name: 'inoreader',
		icon: 'file:inoreader.svg',
		group: ['output'],
		version: 1,
		description: 'Interact with the Inoreader API',
		defaults: {
			name: 'Inoreader',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'inoreaderOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Article',
						value: 'article',
					},
                    {
						name: 'Feed',
						value: 'feed',
					},
				],
				default: 'article',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Get from Feed',
						value: 'getFromFeed',
						description: 'Get articles from a specific feed',
					},
					{
						name: 'Get from Folder',
						value: 'getFromFolder',
						description: 'Get articles from a specific folder',
					},
					{
						name: 'Get from Tag',
						value: 'getFromTag',
						description: 'Get articles from a specific tag',
					},
                    {
						name: 'Get from Read later',
						value: 'getFromReadLater',
						description: 'Get articles from the Read later section',
					},
                    {
						name: 'Save to Read later',
						value: 'saveToReadLater',
						description: 'Save an article to the Read later section',
					},
                    {
						name: 'Save to tag',
						value: 'saveToTag',
						description: 'Save an article to a specific tag',
					},
				],
				default: 'getFromFeed',
				displayOptions: {
					show: {
						resource: ['article'],
					},
				},
			},
            {
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Get all feeds',
						value: 'getAllFeeds',
                        description: 'Get all feeds from the user',
					},
				],
				default: 'getAllFeeds',
				displayOptions: {
					show: {
						resource: ['feed'],
					},
				},
			},
			// Feed selection
			{
				displayName: 'Feed',
				name: 'feedId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getFeeds',
				},
				displayOptions: {
					show: {
						resource: ['article'],
						operation: ['getFromFeed'],
					},
				},
				required: true,
				description: 'Select the feed to get articles from',
                default: '',
			},
			// Folder selection
			{
				displayName: 'Folder',
				name: 'folderId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getFolders',
				},
				displayOptions: {
					show: {
						resource: ['article'],
						operation: ['getFromFolder'],
					},
				},
				required: true,
				description: 'Select the folder to get articles from',
                default: '',
			},
			// Tag selection
			{
				displayName: 'Tag',
				name: 'tagId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				displayOptions: {
					show: {
						resource: ['article'],
						operation: ['getFromTag', 'saveToTag'],
					},
				},
				required: true,
				description: 'Select the tag to get articles from',
                default: '',
			},
			// Common parameters for stream/contents
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				description: 'Maximum number of articles to return',
			},
            {
                displayName: 'Article URL',
                name: 'articleUrl',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['article'],
                        operation: ['saveToReadLater', 'saveToTag'],
                    },
                },
                default: '',
                description: 'URL of the article to save (required if articleTitle or articleContent is not provided)', 
            },
            {
                displayName: 'Article Title',
                name: 'articleTitle',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['article'],
                        operation: ['saveToReadLater', 'saveToTag'],
                    },
                },
                default: '',
                description: 'Title of the article to save (optional)', 
            },
            {
                displayName: 'Article Content',
                name: 'articleContent',
                type: 'string',
                displayOptions: {
                    show: {
                        resource: ['article'],
                        operation: ['saveToReadLater', 'saveToTag'],
                    },
                },
                typeOptions: {
                    rows: 5,
                },
                default: '',
                description: 'Content of the article to save (optional)', 
            },
		],
	};

	methods = {
		loadOptions: {
			// List subscriptions (feeds)
			async getFeeds(this: ILoadOptionsFunctions) {
                const returnData: Array<{ name: string; value: string; description?: string }> = [];
				const response = await this.helpers.requestOAuth2.call(
					this,
					'inoreaderOAuth2Api',
					{
						method: 'GET' as 'GET',
						url: 'https://www.inoreader.com/reader/api/0/subscription/list',
						headers: { Accept: 'application/json' },
					}
				);
				const feeds = typeof response === 'string' ? JSON.parse(response) : response;
				for (const feed of feeds.subscriptions ?? []) {
					returnData.push({
						name: feed.title,
						value: feed.id,
						description: feed.url,
					});
				}
				return returnData;
			},

			// List folders
			async getFolders(this: ILoadOptionsFunctions) {
                const returnData: Array<{ name: string; value: string; description?: string }> = [];
				const response = await this.helpers.requestOAuth2.call(
					this,
					'inoreaderOAuth2Api',
					{
						method: 'GET' as 'GET',
						url: 'https://www.inoreader.com/reader/api/0/tag/list?types=1',
						headers: { Accept: 'application/json' },
					}
				);
				const tags = typeof response === 'string' ? JSON.parse(response) : response;
				for (const tag of tags.tags ?? []) {
					if (tag.type === 'folder') {
						returnData.push({
							name: tag.id.split('/').pop() || tag.id,
							value: tag.id,
						});
					}
				}
				return returnData;
			},

			// List tags
			async getTags(this: ILoadOptionsFunctions) {
                const returnData: Array<{ name: string; value: string; description?: string }> = [];
				const response = await this.helpers.requestOAuth2.call(
					this,
					'inoreaderOAuth2Api',
					{
						method: 'GET' as 'GET',
						url: 'https://www.inoreader.com/reader/api/0/tag/list?types=1',
						headers: { Accept: 'application/json' },
					}
				);
				const tags = typeof response === 'string' ? JSON.parse(response) : response;
				for (const tag of tags.tags ?? []) {
					if (tag.type === 'tag') {
						returnData.push({
							name: tag.id.split('/').pop() || tag.id,
							value: tag.id,
						});
					}
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
        const returnData: Array<{ json: any }> = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			let streamId: string | undefined;
			if (resource === 'article') {
                if(operation === 'saveToReadLater' || operation === 'saveToTag') {
                    const articleUrl = this.getNodeParameter('articleUrl', i) as string;
                    const articleTitle = this.getNodeParameter('articleTitle', i) as string;
                    const articleContent = this.getNodeParameter('articleContent', i) as string;
                    if (!articleUrl && !articleTitle && !articleContent) {
                        throw new Error('At least one of articleUrl, articleTitle, or articleContent must be provided!');
                    }

                    const tagId = this.getNodeParameter('tagId', i) as string | undefined;
                    const options: IRequestOptions = {
                        method: 'POST' as 'POST',
                        url: 'https://www.inoreader.com/reader/api/0/save-web-page?return_json=true&partner=n8n',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Accept: 'application/json',
                        },
                        body: {
                            url: articleUrl,
                            title: articleTitle,
                            content: articleContent,
                            label: tagId ? tagId : null,
                        },
                    };
                    let responseData = await this.helpers.requestOAuth2.call(
                        this,
                        'inoreaderOAuth2Api',
                        options
                    );
                    if (typeof responseData === 'string') {
                        responseData = JSON.parse(responseData);
                    }
                    returnData.push({ json: responseData });

                }else{
                    if (operation === 'getFromFeed') {
                        streamId = this.getNodeParameter('feedId', i) as string;
                    } else if (operation === 'getFromFolder') {
                        streamId = this.getNodeParameter('folderId', i) as string;
                    } else if (operation === 'getFromTag') {
                        streamId = this.getNodeParameter('tagId', i) as string;
                    } else if (operation === 'getFromReadLater') {
                        streamId = 'user/-/state/com.google/starred';
                    }
    
                    const limit = this.getNodeParameter('limit', i, 20) as number;
    
                    if (!streamId) {
                        throw new Error('No streamId resolved!');
                    }
        
                    const qs: Record<string, any> = {
                        n: limit,
                        // You can add more stream/contents parameters here as needed
                    };
        
                    const options: IRequestOptions = {
                        method: 'GET' as 'GET',
                        url: 'https://www.inoreader.com/reader/api/0/stream/contents/' + encodeURIComponent(streamId),
                        headers: { Accept: 'application/json' },
                        qs,
                    };
        
                    let responseData = await this.helpers.requestOAuth2.call(
                        this,
                        'inoreaderOAuth2Api',
                        options
                    );
        
                    if (typeof responseData === 'string') {
                        responseData = JSON.parse(responseData);
                    }
        
                    if (responseData.items) {
                        for (const item of responseData.items) {
                            returnData.push({ json: item });
                        }
                    } else {
                        returnData.push({ json: responseData });
                    }
                }
            }else if (resource === 'feed' && operation === 'getAllFeeds') {
                const options: IRequestOptions = {
                    method: 'GET' as 'GET',
                    url: 'https://www.inoreader.com/reader/api/0/subscription/list',
                    headers: { Accept: 'application/json' },
                };
                
                let responseData = await this.helpers.requestOAuth2.call(
                    this,
                    'inoreaderOAuth2Api',
                    options
                );

                if (typeof responseData === 'string') {
                    responseData = JSON.parse(responseData);
                }

                if (responseData.subscriptions) {
                    for (const feed of responseData.subscriptions) {
                        returnData.push({ json: feed });
                    }
                } else {
                    returnData.push({ json: responseData });
                }
            }
		}

		return this.prepareOutputData(returnData);
	}
}
