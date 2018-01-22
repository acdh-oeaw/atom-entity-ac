'use babel';

// notice data is not being loaded from a local json file
// instead we will fetch suggestions from this URL
const API_URL = 'http://127.0.0.1:8080/exist/apps/rundbriefe-app/ac/ac-person.xql?entity=person&query=';

class EntityAcProvider {
	constructor() {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '*';

		// except when editing a comment within an HTML file
		//this.disableForSelector = '.text.html.basic .comment';

		// make these suggestions appear above default suggestions
		this.suggestionPriority = 3;
	}

	getSuggestions(options) {
		const { prefix } = options;

		// only look for suggestions after 3 characters have been typed
		if (prefix.length >= 3) {
			return this.findMatchingSuggestions(prefix);
		}
	}

	// getPrefix(editor, bufferPosition) {
	// 	// the prefix normally only includes characters back to the last word break
	// 	// which is problematic if your suggestions include punctuation (like "@")
	// 	// this expands the prefix back until a whitespace character is met
	// 	// you can tweak this logic/regex to suit your needs
	// 	let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
	// 	let match = line.match(/\S+$/);
	// 	return match ? match[0] : '';
	// }

	findMatchingSuggestions(prefix) {
		console.log(prefix)
		// using a Promise lets you fetch and return suggestions asynchronously
		// this is useful for hitting an external API without causing Atom to freeze
		return new Promise((resolve) => {
			let newUrl = API_URL+prefix
			// fire off an async request to the external API
			fetch(newUrl)
				.then((response) => {
					// convert raw response data to json
					return response.json();
				})
				.then((json) => {
					console.log(json);
					// filter json (list of suggestions) to those matching the prefix
					let matchingSuggestions = json.item.filter((suggestion) => {
						console.log(suggestion.name.startsWith(prefix));
						return suggestion.name.startsWith(prefix);

					});

					// bind a version of inflateSuggestion() that always passes in prefix
					// then run each matching suggestion through the bound inflateSuggestion()
					let inflateSuggestion = this.inflateSuggestion.bind(this, prefix);
					let inflatedSuggestions = matchingSuggestions.map(inflateSuggestion);

					// resolve the promise to show suggestions
					resolve(inflatedSuggestions);
				})
				.catch((err) => {
					// something went wrong
					console.log(err);
				});
		});
	}

	createSnippet(type, suggestion){
		let snippet = "<rs type='"+type+"' ref='#"+suggestion.id+"'>"
		return snippet
	}

	// clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(replacementPrefix, suggestion) {
		return {
			displayText: suggestion.name,
			snippet: this.createSnippet('person', suggestion),
			sumsi: 'halloSumsi',
			description: suggestion.description,
			descriptionMoreURL: suggestion.more,
			replacementPrefix: replacementPrefix, // ensures entire prefix is replaced
			iconHTML: '<i class="icon-comment"></i>',
			leftLabelHTML:'<h4>hansi4ever</h4>',
			type: 'snippet',
			rightLabelHTML: '<span class="aab-right-label">Snippet</span>' // look in /styles/atom-slds.less
		};
	}

	onDidInsertSuggestion(options) {
		atom.notifications.addSuccess(options.suggestion.id + ' was inserted.');
	}
}
export default new EntityAcProvider();