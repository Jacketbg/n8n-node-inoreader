import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IHttpRequestOptions,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

export class Inoreader implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Inoreader',
		name: 'inoreader',
		icon: 'file:Inoreader.svg',
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
				noDataExpression: true,
				options: [
					{
						name: 'Article',
						value: 'article',
					},
                    {
						name: 'Feed',
						value: 'feed',
					},
					{
						name: 'Tag',
						value: 'tag',
					},
					{
						name: 'Folder',
						value: 'folder',
					},
				],
				default: 'article',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Add Tag',
						value: 'addToTag',
						description: 'Add a tag to an article',
						action: 'Add tag to article',
					},
					{
						name: 'Add to Read Later',
						value: 'addToReadLater',
						description: 'Add an article to the Read later section',
						action: 'Add article to read later',
					},
					{
						name: 'Create in Read Later',
						value: 'saveToReadLater',
						description: 'Create external article and save to the Read later section',
						action: 'Create new article in read later',
					},
					{
						name: 'Create in Tag',
						value: 'saveToTag',
						description: 'Create external article and save to a specific tag',
						action: 'Create new article in a specific tag',
					},
					{
						name: 'Get Many From Feed',
						value: 'getFromFeed',
						description: 'Get articles from a specific feed',
						action: 'Get many articles from feed',
					},
					{
						name: 'Get Many From Folder',
						value: 'getFromFolder',
						description: 'Get articles from a specific folder',
						action: 'Get many articles from folder',
					},
                    {
						name: 'Get Many From Read Later',
						value: 'getFromReadLater',
						description: 'Get articles from the Read later section',
						action: 'Get many articles from read later',
					},
					{
						name: 'Get Many From Tag',
						value: 'getFromTag',
						description: 'Get articles from a specific tag',
						action: 'Get many articles from tag',
					}
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
				noDataExpression: true,
				options: [
					{
						name: 'Get All Feeds',
						value: 'getAllFeeds',
                        description: 'Get all feeds from the user',
						action: 'Get all feeds in user account',
					},
				],
				default: 'getAllFeeds',
				displayOptions: {
					show: {
						resource: ['feed'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get All Tags',
						value: 'getAllTags',
						description: 'Get all tags from the user',
						action: 'Get all tags in user account',
					},
				],
				default: 'getAllTags',
				displayOptions: {
					show: {
						resource: ['tag'],
					},
				},	
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get All Folders',
						value: 'getAllFolders',
						description: 'Get all folders from the user',
						action: 'Get all folders in user account',
					},
				],
				default: 'getAllFolders',
				displayOptions: {
					show: {
						resource: ['folder'],
					},
				},	
			},
			{
				displayName: 'Feed Name or ID',
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
				description: 'Select the feed to get articles from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                default: '',
			},
			{
				displayName: 'Folder Name or ID',
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
				description: 'Select the folder to get articles from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                default: '',
			},
			{
				displayName: 'Tag Name or ID',
				name: 'tagId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				displayOptions: {
					show: {
						resource: ['article'],
						operation: ['getFromTag', 'saveToTag', 'addToTag'],
					},
				},
				required: true,
				description: 'Select the tag to get articles from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                default: '',
			},
			// Common parameters for stream/contents
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['article'],
						operation: ['getFromTag', 'getFromFeed', 'getFromFolder', 'getFromReadLater'],
					},
				},
				description: 'Max number of results to return',
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
                description: 'Title of the article to save (optional, leave empty to let Inoreader fetch it from the URL)', 
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
                description: 'Content of the article to save (optional, leave empty to let Inoreader fetch it from the URL)', 
            },
			{
				displayName: 'Read Later Tag ID',
				type: 'hidden',
				name: 'tagId',
				default: 'user/-/state/com.google/starred',
				displayOptions: {
					show: {
						resource: ['article'],
						operation: ['saveToReadLater', 'addToReadLater'],
					},
				},
				description: 'The tag ID for the Read later section',
			},
			{
				displayName: 'Article ID',
				name: 'articleId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['article'],
						operation: ['addToTag', 'addToReadLater'],
					},
				},
				default: '',
				description: 'ID of the article to which the tag will be added. This is usually in the format "tag:google.com,2005:reader/item/0000000a9de1460f". You can find this ID in the response of the "Get From X" operations as well as the "New Article in X" Trigger.',
			}
		],
	};

	methods = {
		loadOptions: {
			// List subscriptions (feeds)
			async getFeeds(this: ILoadOptionsFunctions) {
                const returnData: Array<{ name: string; value: string; description?: string }> = [];
				const response = await this.helpers.httpRequestWithAuthentication.call(
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
				const response = await this.helpers.httpRequestWithAuthentication.call(
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
				const response = await this.helpers.httpRequestWithAuthentication.call(
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
        const returnData: Array<{ json: any; pairedItem?: { item: number } }> = [];

		const shouldContinueOnFail = this.continueOnFail();

		for (let i = 0; i < items.length; i++) {
			try {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			let streamId: string | undefined;
			if (resource === 'article') {
				if(operation == 'addToReadLater' || operation === 'addToTag') {
					const articleId = this.getNodeParameter('articleId', i) as string;
					if (!articleId) {	
						throw new NodeOperationError(this.getNode(), 'Article ID is required for adding a tag!');
					}
					const tagId = this.getNodeParameter('tagId', i) as string;
					if (!tagId) {
						throw new NodeOperationError(this.getNode(), 'Tag ID is required for adding a tag!');
					}
					const options: IHttpRequestOptions = {
						method: 'POST' as 'POST',
						url: 'https://www.inoreader.com/reader/api/0/edit-tag?return_json=true&partner=n8n',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							Accept: 'application/json',
						},
                        body: `a=${encodeURIComponent(tagId)}&i=${encodeURIComponent(articleId)}`,
					};
					let responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'inoreaderOAuth2Api',
						options
					);
					if (typeof responseData === 'string') {
						responseData = JSON.parse(responseData);
					}
					returnData.push({ json: responseData, pairedItem: { item: i } });
                }else if(operation === 'saveToReadLater' || operation === 'saveToTag') {
                    const articleUrl = this.getNodeParameter('articleUrl', i) as string;
                    const articleTitle = this.getNodeParameter('articleTitle', i) as string;
                    const articleContent = this.getNodeParameter('articleContent', i) as string;
                    if (!articleUrl && !articleTitle && !articleContent) {
                        throw new NodeOperationError(this.getNode(), 'At least one of articleUrl, articleTitle, or articleContent must be provided!');
                    }
					
                    const tagId = this.getNodeParameter('tagId', i) as string | undefined;
                    const options: IHttpRequestOptions = {
                        method: 'POST' as 'POST',
                        url: 'https://www.inoreader.com/reader/api/0/save-web-page?return_json=true&partner=n8n',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Accept: 'application/json',
                        },
                        body: [
							articleUrl ? `url=${encodeURIComponent(articleUrl)}` : '',
							articleTitle ? `title=${encodeURIComponent(articleTitle)}` : '',
							articleContent ? `content=${encodeURIComponent(articleContent)}` : '',
							tagId ? `label=${encodeURIComponent(tagId)}` : '',
						].filter(Boolean).join('&'),
                    };
                    let responseData = await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'inoreaderOAuth2Api',
                        options
                    );
                    if (typeof responseData === 'string') {
                        responseData = JSON.parse(responseData);
                    }
                    returnData.push({ json: responseData, pairedItem: { item: i } });

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
                        throw new NodeOperationError(this.getNode(), 'No streamId resolved!');
                    }
        
                    const qs: Record<string, any> = {
                        n: limit,
                        // You can add more stream/contents parameters here as needed
                    };
        
                    const options: IHttpRequestOptions = {
                        method: 'GET' as 'GET',
                        url: 'https://www.inoreader.com/reader/api/0/stream/contents/' + encodeURIComponent(streamId),
                        headers: { Accept: 'application/json' },
                        qs,
                    };
        
                    let responseData = await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'inoreaderOAuth2Api',
                        options
                    );
        
                    if (typeof responseData === 'string') {
                        responseData = JSON.parse(responseData);
                    }
        
                    if (responseData.items) {
                        for (const item of responseData.items) {
                            returnData.push({ json: item, pairedItem: { item: i } });
                        }
                    } else {
                        returnData.push({ json: responseData, pairedItem: { item: i } });
                    }
                }
            }else if (resource === 'feed' && operation === 'getAllFeeds') {
                const options: IHttpRequestOptions = {
                    method: 'GET' as 'GET',
                    url: 'https://www.inoreader.com/reader/api/0/subscription/list',
                    headers: { Accept: 'application/json' },
                };
                
                let responseData = await this.helpers.httpRequestWithAuthentication.call(
                    this,
                    'inoreaderOAuth2Api',
                    options
                );

                if (typeof responseData === 'string') {
                    responseData = JSON.parse(responseData);
                }

                if (responseData.subscriptions) {
                    for (const feed of responseData.subscriptions) {
                        returnData.push({ json: feed, pairedItem: { item: i } });
                    }
                } else {
                    returnData.push({ json: responseData, pairedItem: { item: i } });
                }
            }else if (resource === 'tag' && operation === 'getAllTags' || operation === 'getAllFolders') {
				const options: IHttpRequestOptions = {
					method: 'GET' as 'GET',
					url: 'https://www.inoreader.com/reader/api/0/tag/list?types=1',
					headers: { Accept: 'application/json' },
				};
				
				let responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'inoreaderOAuth2Api',
					options
				);

				if (typeof responseData === 'string') {
					responseData = JSON.parse(responseData);
				}

				if (responseData.tags) {
					for (const tag of responseData.tags) {
						if( operation === 'getAllTags' && tag.type === 'tag') {
							returnData.push({ json: tag, pairedItem: { item: i } });
						} else if (operation === 'getAllFolders' && tag.type === 'folder') {
							returnData.push({ json: tag, pairedItem: { item: i } });
						}
					}
				} else {
					returnData.push({ json: responseData, pairedItem: { item: i } });
				}
			}
		} catch (error) {
			if (shouldContinueOnFail) {
				returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
				continue;
			}
			throw new NodeOperationError(this.getNode(), (error as Error), { itemIndex: i });
			}
		}

		return this.prepareOutputData(returnData);
	}
}
