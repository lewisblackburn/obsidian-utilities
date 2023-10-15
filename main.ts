import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface UtilitySettings {
	enableAutoReferencing: boolean;
}

const DEFAULT_SETTINGS: UtilitySettings = {
	enableAutoReferencing: true
}

export default class MyPlugin extends Plugin {
	settings: UtilitySettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GeneralSettingsTab(this.app, this));


		// An @AdamLearns inspired event listener to quickly add references to the editor.
		this.registerEvent(this.app.workspace.on("editor-change", (editor) => {
			if (editor.getValue().includes('.ref')) {
				setTimeout(async () => {
					//TODO: Maybe check if the clipboard value is a link?
					// If it isn't, leave the reference blank
					const text = await navigator.clipboard.readText();
					const value = editor.getValue().replace('.ref', `[(reference)](${text})`);
					editor.setValue(value);
				}, 1);
			}
		}));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class GeneralSettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "General Settings" })

		new Setting(this.containerEl)
			.setName("Enable Auto Reference")
			.setDesc("Enable auto creating a reference from clipboard when \"(reference)\" is typed.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.enableAutoReferencing)
					.onChange(async (value) => {
						this.plugin.settings.enableAutoReferencing = value;
						await this.plugin.saveSettings();
					})
			);

	}
}
