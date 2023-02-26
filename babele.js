async function __PF2E_TS_init(_this, wrapped, ...args) {
    await wrapped();

    return new Promise((resolve, reject) => {
        for (let metadata of game.data.packs) {
            const collection = `${metadata.packageName}.${metadata.name}`;
            if(_this.supported(metadata)) {
                const translatedCompendium = _this.packs.get(collection);
                const variants = _this.translations.find(t => t.collection === collection)?.variants || [];
                if (translatedCompendium && variants?.length > 0) {
                    translatedCompendium.variants = variants;
                    _this.packs.set(collection, translatedCompendium);
                }
            }
        }
        resolve();
    });
};

function __PF2E_TS_hasTranslation(_this, wrapped, data) {
    if (!!_this.translations[data._id]) return wrapped(data);
    if (data.name?.length > 1 && data.name.indexOf('(') > -1 && data.name.indexOf(')') > -1) {
        if (!!_this.translations[data.name]) return true;
        const match = /([A-Za-z0-9\s^(]+)\(([A-Za-z0-9\s,\(\)]+)\)/.exec(data.name);
        let [name, variant] = match ? [match[1], match[2]] : [];
        if (name && variant && name?.length > 0 && variant?.length > 0) {
            name = name.trim();
            if (!!_this.translations[name]) return true;
        } else return wrapped(data);
    }
    return wrapped(data);
};

function __PF2E_TS_translationsFor(_this, wrapped, data) {
    if (!!_this.translations[data._id]) return wrapped(data);
    if (data.name?.length > 1 && data.name.indexOf('(') > -1 && data.name.indexOf(')') > -1) {
        if (!!_this.translations[data.name]) return _this.translations[data.name];
        const match = /([A-Za-z0-9\s^(]+)\(([A-Za-z0-9\s,\(\)]+)\)/.exec(data.name);
        let [name, variant] = match ? [match[1], match[2]] : [];
        if (name && variant && name?.length > 0 && variant?.length > 0) {
            name = name.trim();
            if (!!_this.translations[name]) {
                variant = variant.trim();
                let data = Object.assign({}, _this.translations[name]);
                const translatedName = data.name;
                let translatedVariant = '';

                const variants = variant.replaceAll('  ', ' ').replaceAll(', ', ',')
                                        .replaceAll(',', ')(').replaceAll(') (', ')(').split(')(');

                if (data['variants'] || _this.variants) {
                    for (let variant of variants) {
                        let variantData = data['variants'] ? data['variants'].filter(v => v.id === variant)[0] || false : false;
                        if (!variantData) variantData = _this.variants?.filter(v => v.id === variant)[0] || false;
                        if (variantData) {
                            if (data.id) delete data.id;
                            if (variantData?.name) translatedVariant = translatedVariant === '' 
                                                                         ? variantData.name
                                                                         : `${translatedVariant}) (${variantData.name}`;
                            
                            data = Object.assign(data, variantData);
                        }
                    }
                }
                data.name = `${translatedName} (${(translatedVariant !== '' ? translatedVariant : variant)})`;
                
                return data;
            } else return wrapped(data);
        } else return wrapped(data);
    }
    return wrapped(data);
}

Hooks.on('init', () => {
    if (typeof libWrapper === 'function') {
        libWrapper.register('pf2e-ts-rub', 'Babele.prototype.init', async function (wrapped, ...args) {
            return __PF2E_TS_init(this, wrapped, ...args);
        }, 'WRAPPER');
        libWrapper.register('pf2e-ts-rub', 'TranslatedCompendium.prototype.hasTranslation', function (wrapped, ...args) {
            return __PF2E_TS_hasTranslation(this, wrapped, ...args);
        }, 'MIXED');
        libWrapper.register('pf2e-ts-rub', 'TranslatedCompendium.prototype.translationsFor', function (wrapped, ...args) {
            return __PF2E_TS_translationsFor(this, wrapped, ...args);
        }, 'MIXED');
    }

    if(typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'pf2e-ts-rub',
            lang: 'ru',
            dir: 'compendium'
        });
    }
});