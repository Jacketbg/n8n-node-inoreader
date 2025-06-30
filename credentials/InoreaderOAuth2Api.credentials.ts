import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class InoreaderOAuth2Api implements ICredentialType {
	name = 'inoreaderOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Inoreader OAuth2 API';
	documentationUrl = 'https://www.inoreader.com/developers/oauth';

	queryParameters = [
		{
			name: 'access_type',
			value: 'offline',
		},
	];
	
	properties: INodeProperties[] = [
		{
			displayName: 'App ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'App Key',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden', // Hidden from user input!
			default: 'https://www.inoreader.com/oauth2/auth',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden', // Hidden from user input!
			default: 'https://www.inoreader.com/oauth2/token',
		},
		{
			displayName: 'Scopes',
			name: 'scope',
			type: 'string',
			default: 'read write',
			description: 'Space-separated list of scopes (leave default unless you need less access)',
		},
	];
}
