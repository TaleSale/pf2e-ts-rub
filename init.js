Hooks.once('init', async function () {
	
	const systemTranslationsFolder = "modules/pf2e-ts-rub/lang/";
	const moduleTranslationsFolder = "modules/pf2e-ts-rub/modules/";
	
	const systemFiles = ["en.json", "glossary-en.json", "re-en.json", "s-re-en.json"]	
	const moduleFiles = [
		{"id":"healthEstimate", "path":"healthEstimate.json"},
		{"id":"xdy-pf2e-workbench", "path":"xdy-pf2e-workbench.json"}
	]

	game.settings.register('pf2e-ts-rub', 'translateSystem', {
        name: "Перевод системы Pathfinder 2e",
        scope: 'world',
        type: Boolean,
        config: true,
        default: true,
        restricted: true,
        requiresReload: true
    });
	
	moduleFiles.forEach(m =>{
		let id = m.id;		
		let module = game.modules.get(m.id);
		
		console.log("Checking mod: " + m.id);
		if(module?.active){
			game.settings.register("pf2e-ts-rub", "translateModule_" + m.id, {
				name: "Перевод модуля " + module.title,
				scope: 'world',
				type: Boolean,
				config: true,
				default: true,
				restricted: true,
				requiresReload: true
			});
		}
	});

    if (typeof libWrapper === "function") {
        libWrapper.register("pf2e-ts-rub",
            "game.i18n._getTranslations",
            loadSelectedTranslations,
            "MIXED");
    }
    else {
        new Dialog({
            title: "Выбор перевода",
            content: `<p>Для работы модуля перевода необходимо активировать модуль <b>libWrapper</b></p>`,
            buttons: {
                done: {
                    label: "Хорошо",
                },
            },
        }).render(true);
    }

    async function loadSelectedTranslations(wrapped, lang) {
        const defaultTranslations = await wrapped(lang);
        const promises = [];
		
		if (game.i18n.lang != "ru")
			return defaultTranslations;
		
		if(game.settings.get("pf2e-ts-rub", "translateSystem")){
			systemFiles.forEach(f =>{
				promises.push(this._loadTranslationFile(systemTranslationsFolder + f));
			});
		}
		
		moduleFiles.forEach(m =>{
			let id = m.id;		
			let module = game.modules.get(m.id);
		
			if(module?.active && game.settings.get("pf2e-ts-rub", "translateModule_" + m.id)){
				promises.push(this._loadTranslationFile(moduleTranslationsFolder + m.path));
			}
		});

        await Promise.all(promises);
        for (let p of promises) {
            let json = await p;
            foundry.utils.mergeObject(defaultTranslations, json, { inplace: true });
        }

        return defaultTranslations;
    }

});