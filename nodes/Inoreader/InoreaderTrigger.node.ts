import type {
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	ILoadOptionsFunctions,
	NodeConnectionType,
	IRequestOptions,
    INodeExecutionData
	
} from 'n8n-workflow';

// import { pollTimesTriggerFields } from 'n8n-workflow';

export class InoreaderTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Inoreader Trigger',
		name: 'inoreaderTrigger',
		icon: 'file:Inoreader.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers when a new article appears in Inoreader',
		defaults: {
			name: 'Inoreader Trigger',
		},
		polling: true,
		inputs: [],
		outputs: ['main'] as NodeConnectionType[],    
		credentials: [
			{
				name: 'inoreaderOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				options: [
					{
						name: 'Feed',
						value: 'feed',
						description: 'New article in a feed',
					},
					{
						name: 'Folder',
						value: 'folder',
						description: 'New article in a folder',
					},
					{
						name: 'Read Later',
						value: 'readLater',
						description: 'New article in Read later',
					},
				],
				default: 'feed',
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
						triggerType: ['feed'],
					},
				},
				required: true,
				default: '',
				description: 'Feed to watch for new articles. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
						triggerType: ['folder'],
					},
				},
				required: true,
				default: '',
				description: 'Folder to watch for new articles. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	};

	methods = {
		loadOptions: {
			async getFeeds(this: ILoadOptionsFunctions) {
				const returnData: Array<{ name: string; value: string }> = [];
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
					});
				}
				return returnData;
			},
			async getFolders(this: ILoadOptionsFunctions) {
				const returnData: Array<{ name: string; value: string }> = [];
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
		},
	};

	// The core polling logic
    async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const triggerType = this.getNodeParameter('triggerType') as string;

		let streamId: string | undefined;
		if (triggerType === 'feed') {
			streamId = this.getNodeParameter('feedId') as string;
		} else if (triggerType === 'folder') {
			streamId = this.getNodeParameter('folderId') as string;
		} else if (triggerType === 'readLater') {
			streamId = 'user/-/state/com.google/starred';
		}

		const qs = {
			n: 20,
		};

		const options: IRequestOptions = {
			method: 'GET' as 'GET',
			url: 'https://www.inoreader.com/reader/api/0/stream/contents/' + encodeURIComponent(streamId!),
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

		// n8n provides static data to remember the last processed article
		const staticData = this.getWorkflowStaticData('node');
		const lastSeen = staticData.lastSeenId as string | undefined;

        const newItems = [] as Array<{ json: any }>;
		for (const item of responseData.items ?? []) {
			// Stop when we reach the last seen article (IDs are unique and stable)
			if (lastSeen && item.timestampUsec === lastSeen) break;
			newItems.push({ json: item });
		}

		// Save the newest article id for next poll
		if (responseData.items?.length > 0) {
			staticData.lastSeenId = responseData.items[0].timestampUsec;
		}

		// Return new articles (or empty array if none)
        return [newItems.reverse()];
	}
}
